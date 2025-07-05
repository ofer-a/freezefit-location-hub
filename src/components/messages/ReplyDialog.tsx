
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerEmail: string;
  customerName: string;
  originalSubject?: string;
}

const ReplyDialog = ({ isOpen, onClose, customerEmail, customerName, originalSubject }: ReplyDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState(originalSubject ? `Re: ${originalSubject}` : '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !subject.trim() || !message.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // First, get the customer's user ID from their email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (profileError || !profiles) {
        throw new Error('לא ניתן למצוא את פרטי הלקוח');
      }

      // Get the institute ID for the current user
      const { data: institutes, error: instituteError } = await supabase
        .from('institutes')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (instituteError || !institutes) {
        throw new Error('לא ניתן למצוא את פרטי המכון');
      }

      // Insert the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          user_id: profiles.id,
          institute_id: institutes.id,
          sender_type: 'institute_owner',
          message_type: 'inquiry_reply',
          subject: subject.trim(),
          content: message.trim(),
        });

      if (messageError) throw messageError;

      toast({
        title: "הודעה נשלחה",
        description: `התשובה נשלחה ללקוח ${customerName}`,
      });

      // Reset form and close dialog
      setSubject('');
      setMessage('');
      onClose();

    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את ההודעה",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>שלח תשובה ללקוח</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSendReply} className="space-y-4">
          <div>
            <Label htmlFor="customer">לקוח</Label>
            <Input 
              id="customer" 
              value={`${customerName} (${customerEmail})`} 
              disabled 
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="subject">נושא</Label>
            <Input 
              id="subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="נושא ההודעה"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">הודעה</Label>
            <Textarea 
              id="message" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב את תשובתך כאן..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? 'שולח...' : 'שלח תשובה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyDialog;
