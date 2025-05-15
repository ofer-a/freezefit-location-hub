
import { useState } from 'react';
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

// Mock data types
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

  // Workshops state
  const [workshops, setWorkshops] = useState<Workshop[]>([
    {
      id: 1,
      title: 'סדנת התאוששות לספורטאים',
      description: 'סדנה מעשית לספורטאים הרוצים ללמוד טכניקות התאוששות מתקדמות',
      date: '20/05/2025',
      time: '18:00',
      duration: '90 דקות',
      price: 200,
      maxParticipants: 15,
      currentParticipants: 8
    },
    {
      id: 2,
      title: 'יסודות קריותרפיה',
      description: 'סדנת מבוא לשיטות טיפול בקור וההשפעות הבריאותיות',
      date: '25/05/2025',
      time: '17:30',
      duration: '120 דקות',
      price: 180,
      maxParticipants: 20,
      currentParticipants: 12
    }
  ]);
  
  // Services state
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: 'טיפול קריותרפיה סטנדרטי',
      description: 'טיפול בסיסי עם שהייה בטמפרטורות נמוכות',
      price: 150,
      duration: '45 דקות'
    },
    {
      id: 2,
      name: 'טיפול ספורטאים מתקדם',
      description: 'טיפול המותאם במיוחד לספורטאים אחרי אימונים ותחרויות',
      price: 250,
      duration: '60 דקות'
    },
    {
      id: 3,
      name: 'חבילת התאוששות מלאה',
      description: 'טיפול משולב עם טיפולי קור וחימום לאחר פציעות',
      price: 350,
      duration: '90 דקות'
    }
  ]);
  
  // Business hours state
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
    { day: 'ראשון', hours: '8:00 - 20:00', isOpen: true },
    { day: 'שני', hours: '8:00 - 20:00', isOpen: true },
    { day: 'שלישי', hours: '8:00 - 20:00', isOpen: true },
    { day: 'רביעי', hours: '8:00 - 20:00', isOpen: true },
    { day: 'חמישי', hours: '8:00 - 20:00', isOpen: true },
    { day: 'שישי', hours: '8:00 - 14:00', isOpen: true },
    { day: 'שבת', hours: 'סגור', isOpen: false }
  ]);

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

  // Handle new workshop submission
  const handleAddWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    
    const workshopToAdd: Workshop = {
      id: workshops.length + 1,
      ...newWorkshop,
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
  };

  // Handle new service submission
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceToAdd: Service = {
      id: services.length + 1,
      ...newService
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
  };

  // Handle business hours update
  const handleUpdateHours = (e: React.FormEvent) => {
    e.preventDefault();
    
    setBusinessHours(editingHours);
    setShowEditHoursDialog(false);
    
    toast({
      title: "שעות פעילות עודכנו",
      description: "שעות הפעילות של העסק עודכנו בהצלחה",
    });
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
