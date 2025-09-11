
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, X, Edit, Save } from 'lucide-react';
import { dbOperations } from '@/lib/database';

// Database entity interfaces
interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

const StoreManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Workshops state - now loaded from database
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  
  // Services state - now loaded from database
  const [services, setServices] = useState<Service[]>([]);
  
  // Business hours state - now loaded from database
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);

  // Dialog states
  const [showNewWorkshopDialog, setShowNewWorkshopDialog] = useState(false);
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [showEditHoursDialog, setShowEditHoursDialog] = useState(false);
  
  // Form states
  const [newWorkshop, setNewWorkshop] = useState<Omit<Workshop, 'id' | 'currentParticipants'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    price: 0,
    maxParticipants: 10
  });
  
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: ''
  });
  
  const [editingHours, setEditingHours] = useState<BusinessHours[]>(businessHours);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        // Get user's institutes
        const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
        if (userInstitutes.length === 0) return;

        const instituteId = userInstitutes[0].id;

        // Load workshops
        const workshopsData = await dbOperations.getWorkshopsByInstitute(instituteId);
        const transformedWorkshops = (workshopsData as any[]).map((workshop: any) => ({
          id: parseInt(workshop.id.split('-')[0], 16),
          title: workshop.title,
          description: workshop.description,
          date: new Date(workshop.workshop_date).toLocaleDateString('he-IL'),
          time: workshop.workshop_time,
          duration: `${workshop.duration} דקות`,
          price: workshop.price,
          maxParticipants: workshop.max_participants,
          currentParticipants: workshop.current_participants
        }));
        setWorkshops(transformedWorkshops);

        // Load services
        const servicesData = await dbOperations.getServicesByInstitute(instituteId);
        const transformedServices = (servicesData as any[]).map((service: any) => ({
          id: parseInt(service.id.split('-')[0], 16),
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration
        }));
        setServices(transformedServices);

        // Load business hours
        const businessHoursData = await dbOperations.getBusinessHoursByInstitute(instituteId);
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const transformedHours = dayNames.map((day, index) => {
          const dayData = (businessHoursData as any[]).find((bh: any) => bh.day_of_week === index);
          if (dayData && dayData.is_open) {
            return {
              day,
              hours: `${dayData.open_time} - ${dayData.close_time}`,
              isOpen: true
            };
          } else {
            return {
              day,
              hours: 'סגור',
              isOpen: false
            };
          }
        });
        setBusinessHours(transformedHours);
        setEditingHours(transformedHours);

      } catch (error) {
        console.error('Error loading store data:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני החנות",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [user?.id, toast]);

  // Handle new workshop submission
  const handleAddWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף סדנה ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      if (userInstitutes.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מכון לשיוך הסדנה",
          variant: "destructive",
        });
        return;
      }

      const workshopData = {
        institute_id: userInstitutes[0].id,
        title: newWorkshop.title,
        description: newWorkshop.description,
        workshop_date: newWorkshop.date,
        workshop_time: newWorkshop.time,
        duration: newWorkshop.duration,
        price: newWorkshop.price,
        max_participants: newWorkshop.maxParticipants
      };

      const savedWorkshop = await dbOperations.createWorkshop(workshopData);
      
      // Add to local state
      const workshopToAdd: Workshop = {
        id: parseInt((savedWorkshop as any).id.split('-')[0], 16),
        title: (savedWorkshop as any).title,
        description: (savedWorkshop as any).description,
        date: new Date((savedWorkshop as any).workshop_date).toLocaleDateString('he-IL'),
        time: (savedWorkshop as any).workshop_time,
        duration: `${(savedWorkshop as any).duration} דקות`,
        price: (savedWorkshop as any).price,
        maxParticipants: (savedWorkshop as any).max_participants,
        currentParticipants: 0
      };
      
      setWorkshops([...workshops, workshopToAdd]);
      setShowNewWorkshopDialog(false);
      
      // Reset form
      setNewWorkshop({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '',
        price: 0,
        maxParticipants: 10
      });
      
      toast({
        title: "סדנה נוספה",
        description: "הסדנה נוספה בהצלחה לרשימת הסדנאות",
      });
    } catch (error) {
      console.error('Error adding workshop:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הסדנה",
        variant: "destructive",
      });
    }
  };

  // Handle new service submission
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף שירות ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      if (userInstitutes.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מכון לשיוך השירות",
          variant: "destructive",
        });
        return;
      }

      const serviceData = {
        institute_id: userInstitutes[0].id,
        name: newService.name,
        description: newService.description,
        price: newService.price,
        duration: newService.duration
      };

      const savedService = await dbOperations.createService(serviceData);
      
      // Add to local state
      const serviceToAdd: Service = {
        id: parseInt((savedService as any).id.split('-')[0], 16),
        name: (savedService as any).name,
        description: (savedService as any).description,
        price: (savedService as any).price,
        duration: (savedService as any).duration
      };
      
      setServices([...services, serviceToAdd]);
      setShowNewServiceDialog(false);
      
      // Reset form
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: ''
      });
      
      toast({
        title: "שירות נוסף",
        description: "השירות נוסף בהצלחה למחירון",
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את השירות",
        variant: "destructive",
      });
    }
  };

  // Handle business hours update
  const handleUpdateHours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן שעות פעילות ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      if (userInstitutes.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מכון לעדכון שעות הפעילות",
          variant: "destructive",
        });
        return;
      }

      const instituteId = userInstitutes[0].id;
      
      // Get existing business hours
      const existingHours = await dbOperations.getBusinessHoursByInstitute(instituteId);
      
      // Update or create business hours for each day
      for (let dayIndex = 0; dayIndex < editingHours.length; dayIndex++) {
        const dayHours = editingHours[dayIndex];
        const existingDay = existingHours.find(h => h.day_of_week === dayIndex);
        
        if (dayHours.isOpen) {
          const [openTime, closeTime] = dayHours.hours.split(' - ');
          const businessHoursData = {
            institute_id: instituteId,
            day_of_week: dayIndex,
            open_time: openTime,
            close_time: closeTime,
            is_open: true
          };
          
          if (existingDay) {
            // Update existing
            await dbOperations.updateBusinessHours(existingDay.id, businessHoursData);
          } else {
            // Create new
            await dbOperations.createBusinessHours(businessHoursData);
          }
        } else {
          // Day is closed
          if (existingDay) {
            await dbOperations.updateBusinessHours(existingDay.id, {
              is_open: false,
              open_time: null,
              close_time: null
            });
          } else {
            await dbOperations.createBusinessHours({
              institute_id: instituteId,
              day_of_week: dayIndex,
              is_open: false,
              open_time: null,
              close_time: null
            });
          }
        }
      }
      
      setBusinessHours(editingHours);
      setShowEditHoursDialog(false);
      
      toast({
        title: "שעות פעילות עודכנו",
        description: "שעות הפעילות של העסק עודכנו בהצלחה",
      });
    } catch (error) {
      console.error('Error updating business hours:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את שעות הפעילות",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">ניהול מכון</h1>
              <p className="text-gray-600 mt-1">ניהול סדנאות, שעות פעילות ומחירון</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/dashboard">
                <Button variant="outline">חזרה ללוח הבקרה</Button>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="workshops" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workshops">סדנאות</TabsTrigger>
              <TabsTrigger value="hours">שעות פעילות</TabsTrigger>
              <TabsTrigger value="pricing">מחירון</TabsTrigger>
            </TabsList>
            
            {/* Workshops Tab */}
            <TabsContent value="workshops" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>ניהול סדנאות</CardTitle>
                  <Button onClick={() => setShowNewWorkshopDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף סדנה
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {workshops.length > 0 ? (
                      workshops.map(workshop => (
                        <div key={workshop.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{workshop.title}</h3>
                              <p className="text-gray-600 mt-1 max-w-xl">{workshop.description}</p>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                                <div className="flex items-center text-gray-700">
                                  <Calendar className="h-4 w-4 ml-1" />
                                  <span>{workshop.date}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <Clock className="h-4 w-4 ml-1" />
                                  <span>{workshop.time}, {workshop.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 lg:mt-0">
                              <div className="bg-primary/10 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg">{workshop.price} ₪</p>
                                <p className="text-sm text-gray-600">
                                  {workshop.currentParticipants}/{workshop.maxParticipants} משתתפים
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">אין סדנאות זמינות כרגע. הוסף סדנה חדשה.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Business Hours Tab */}
            <TabsContent value="hours" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>שעות פעילות</CardTitle>
                  <Button onClick={() => {
                    setEditingHours(businessHours);
                    setShowEditHoursDialog(true);
                  }}>
                    <Edit className="mr-2 h-4 w-4" /> ערוך שעות פעילות
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {businessHours.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-lg">{day.day}</p>
                        <p className={day.isOpen ? "text-gray-700" : "text-red-500"}>{day.hours}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>מחירון טיפולים</CardTitle>
                  <Button onClick={() => setShowNewServiceDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף שירות
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {services.length > 0 ? (
                      services.map(service => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{service.name}</h3>
                              <p className="text-gray-600 mt-1">{service.description}</p>
                              <p className="text-sm text-gray-500 mt-2">משך: {service.duration}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:mr-4">
                              <div className="bg-primary/10 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg">{service.price} ₪</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">המחירון ריק כרגע. הוסף שירותים חדשים.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* New Workshop Dialog */}
      <Dialog open={showNewWorkshopDialog} onOpenChange={setShowNewWorkshopDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>הוספת סדנה חדשה</DialogTitle>
            <DialogDescription>
              מלא את הפרטים להוספת סדנה חדשה למערכת.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddWorkshop} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">כותרת הסדנה</Label>
                <Input 
                  id="title" 
                  value={newWorkshop.title}
                  onChange={(e) => setNewWorkshop({...newWorkshop, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">תיאור</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  value={newWorkshop.description}
                  onChange={(e) => setNewWorkshop({...newWorkshop, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">תאריך</Label>
                  <Input 
                    id="date" 
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={newWorkshop.date}
                    onChange={(e) => setNewWorkshop({...newWorkshop, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time">שעה</Label>
                  <Input 
                    id="time" 
                    type="text"
                    placeholder="HH:MM"
                    value={newWorkshop.time}
                    onChange={(e) => setNewWorkshop({...newWorkshop, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">משך</Label>
                  <Input 
                    id="duration" 
                    type="text"
                    placeholder="למשל: 90 דקות"
                    value={newWorkshop.duration}
                    onChange={(e) => setNewWorkshop({...newWorkshop, duration: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price">מחיר (₪)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={newWorkshop.price.toString()}
                    onChange={(e) => setNewWorkshop({...newWorkshop, price: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">מספר משתתפים מקסימלי</Label>
                <Input 
                  id="maxParticipants" 
                  type="number"
                  value={newWorkshop.maxParticipants.toString()}
                  onChange={(e) => setNewWorkshop({...newWorkshop, maxParticipants: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewWorkshopDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">שמור סדנה</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* New Service Dialog */}
      <Dialog open={showNewServiceDialog} onOpenChange={setShowNewServiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>הוספת שירות חדש</DialogTitle>
            <DialogDescription>
              הוסף שירות חדש למחירון שלך.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddService} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceName">שם השירות</Label>
                <Input 
                  id="serviceName" 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="serviceDescription">תיאור</Label>
                <Textarea 
                  id="serviceDescription" 
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="servicePrice">מחיר (₪)</Label>
                  <Input 
                    id="servicePrice" 
                    type="number"
                    value={newService.price.toString()}
                    onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="serviceDuration">משך</Label>
                  <Input 
                    id="serviceDuration" 
                    type="text"
                    placeholder="למשל: 45 דקות"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewServiceDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">הוסף שירות</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Business Hours Dialog */}
      <Dialog open={showEditHoursDialog} onOpenChange={setShowEditHoursDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>עריכת שעות פעילות</DialogTitle>
            <DialogDescription>
              עדכן את שעות הפעילות של העסק שלך.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateHours} className="space-y-4 py-4">
            <div className="space-y-4">
              {editingHours.map((day, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={day.hours}
                      onChange={(e) => {
                        const updated = [...editingHours];
                        updated[index].hours = e.target.value;
                        setEditingHours(updated);
                      }}
                      className="w-40"
                      disabled={!day.isOpen}
                    />
                    <Button
                      type="button"
                      variant={day.isOpen ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const updated = [...editingHours];
                        updated[index].isOpen = !day.isOpen;
                        if (!day.isOpen) {
                          updated[index].hours = '8:00 - 20:00';
                        } else {
                          updated[index].hours = 'סגור';
                        }
                        setEditingHours(updated);
                      }}
                    >
                      {day.isOpen ? 'פתוח' : 'סגור'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditHoursDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">שמור שינויים</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default StoreManagement;
