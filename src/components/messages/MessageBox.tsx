
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Clock, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dbOperations, Message } from '@/lib/database';

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBox = ({ isOpen, onClose }: MessageBoxProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
    }
  }, [isOpen, user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const data = await dbOperations.getMessagesByUser(user.id);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את ההודעות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await dbOperations.markMessageAsRead(messageId);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_refusal':
        return 'סירוב תור';
      case 'inquiry_reply':
        return 'תשובה לפנייה';
      default:
        return type;
    }
  };

  const getSenderTypeLabel = (type: string) => {
    switch (type) {
      case 'trainer':
        return 'מטפל';
      case 'institute_owner':
        return 'בעל מכון';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            תיבת הודעות
          </DialogTitle>
          <DialogDescription>
            צפה וענה על הודעות מלקוחות
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">טוען הודעות...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">אין לך הודעות חדשות</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    !message.is_read ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{message.subject}</h3>
                      <div className="flex gap-2">
                        {!message.is_read && (
                          <Badge variant="default" className="bg-blue-500">
                            חדש
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {getMessageTypeLabel(message.message_type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>{getSenderTypeLabel(message.sender_type)}{message.sender_name ? ` - ${message.sender_name}` : ''}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(message.created_at).toLocaleDateString('he-IL')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(message.created_at).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedMessage && (
          <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>{selectedMessage.subject}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {getMessageTypeLabel(selectedMessage.message_type)}
                  </Badge>
                  <Badge variant="secondary">
                    {getSenderTypeLabel(selectedMessage.sender_type)}{selectedMessage.sender_name ? ` - ${selectedMessage.sender_name}` : ''}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  {new Date(selectedMessage.created_at).toLocaleString('he-IL')}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageBox;
