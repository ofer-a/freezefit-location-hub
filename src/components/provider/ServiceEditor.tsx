
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface Service {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
}

interface ServiceEditorProps {
  instituteId: string;
}

const ServiceEditor = ({ instituteId }: ServiceEditorProps) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Service>({
    name: '',
    description: '',
    price: 0,
    duration: ''
  });

  const {
    useServices,
    useCreateService,
    useUpdateService,
    useDeleteService
  } = useSupabaseData();

  const { data: services = [], isLoading } = useServices(instituteId);
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, duration: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: 0, duration: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService?.id) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          serviceData: formData
        });
      } else {
        await createServiceMutation.mutateAsync({
          ...formData,
          institute_id: instituteId
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השירות?')) {
      try {
        await deleteServiceMutation.mutateAsync(serviceId);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (isLoading) {
    return <div>טוען שירותים...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול שירותים</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-freezefit-300 hover:bg-freezefit-400">
              <Plus className="h-4 w-4 mr-2" />
              הוסף שירות חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'עריכת שירות' : 'הוספת שירות חדש'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם השירות</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">תיאור</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">מחיר (₪)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">משך זמן</label>
                <Input
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="למשל: 60 דקות"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingService ? 'עדכן' : 'הוסף'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  ביטול
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {service.description && (
                <p className="text-gray-600 mb-2">{service.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">₪{service.price}</span>
                {service.duration && (
                  <span className="text-sm text-gray-500">{service.duration}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceEditor;
