
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileDialog = ({ isOpen, onClose }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '050-1234567',
    address: 'רחוב האלון 5, תל אביב'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would update the user profile in the database
    toast({
      title: "פרטים עודכנו בהצלחה",
      description: "הפרטים האישיים שלך עודכנו במערכת",
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '050-1234567',
      address: 'רחוב האלון 5, תל אביב'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-right text-lg font-semibold">
            עדכון פרטים אישיים
          </DialogTitle>
          <p className="text-right text-sm text-gray-600 mt-2">
            שנה את הפרטים האישיים שלך ולחץ על "שמור" כדי לעדכן.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-right block">שם מלא</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="text-right"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="text-right"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-right block">טלפון</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="text-right"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-right block">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="text-right"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              שמור
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
