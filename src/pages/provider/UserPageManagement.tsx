
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
import { User, Image as ImageIcon, Star, Plus, X, Upload } from 'lucide-react';

// Types for therapists and gallery
interface Therapist {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  bio: string;
  image: string;
}

interface GalleryImage {
  id: number;
  url: string;
  title: string;
}

interface Review {
  id: number;
  customerName: string;
  rating: number;
  text: string;
  date: string;
}

const UserPageManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for therapists, reviews and gallery
  const [therapists, setTherapists] = useState<Therapist[]>([
    {
      id: 1,
      name: 'דני כהן',
      specialty: 'ספורטאים',
      experience: 5,
      bio: 'מומחה בטיפול בספורטאים מקצועיים. בעל תואר ראשון בפיזיותרפיה ותעודת התמחות בשיקום ספורטיבי.',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'מיכל לוי',
      specialty: 'שיקום',
      experience: 8,
      bio: 'מתמחה בשיקום לאחר פציעות ספורט. בעלת 8 שנות ניסיון בעבודה עם ספורטאי עילית.',
      image: '/placeholder.svg'
    }
  ]);
  
  const [gallery, setGallery] = useState<GalleryImage[]>([
    {
      id: 1,
      url: '/placeholder.svg',
      title: 'חדר טיפולים ראשי'
    },
    {
      id: 2,
      url: '/placeholder.svg',
      title: 'אמבטיות קרח מקצועיות'
    },
    {
      id: 3,
      url: '/placeholder.svg',
      title: 'אזור המתנה'
    }
  ]);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      customerName: 'יוסי ישראלי',
      rating: 5,
      text: 'שירות מעולה ומקצועי מאוד. התאוששתי מהר מאימון מפרך!',
      date: '10/05/2025'
    },
    {
      id: 2,
      customerName: 'רונית כהן',
      rating: 4,
      text: 'צוות נחמד מאוד, נהניתי מהטיפול. ממליצה!',
      date: '05/05/2025'
    },
    {
      id: 3,
      customerName: 'משתמש אנונימי',
      rating: 5,
      text: 'מתקנים ברמה גבוהה ויחס אישי. אחזור שוב בהחלט.',
      date: '01/05/2025'
    }
  ]);
  
  // Dialog states
  const [showNewTherapistDialog, setShowNewTherapistDialog] = useState(false);
  const [showNewImageDialog, setShowNewImageDialog] = useState(false);
  
  // Selected therapist for removal
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
  const [showRemoveTherapistDialog, setShowRemoveTherapistDialog] = useState(false);
  
  // Form states
  const [newTherapist, setNewTherapist] = useState<Omit<Therapist, 'id' | 'image'>>({
    name: '',
    specialty: '',
    experience: 0,
    bio: ''
  });
  
  const [newImage, setNewImage] = useState<Omit<GalleryImage, 'id' | 'url'>>({
    title: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [therapistImageFile, setTherapistImageFile] = useState<File | null>(null);

  // Handle therapist image upload for existing therapists
  const handleTherapistImageUpload = (therapistId: number, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    
    setTherapists(prevTherapists => 
      prevTherapists.map(therapist => 
        therapist.id === therapistId 
          ? { ...therapist, image: imageUrl }
          : therapist
      )
    );
    
    toast({
      title: "תמונה עודכנה",
      description: "תמונת המטפל עודכנה בהצלחה",
    });
  };

  // Handle therapist image selection
  const handleTherapistImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTherapistImageFile(e.target.files[0]);
    }
  };
  
  // Handle gallery image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Add new therapist
  const handleAddTherapist = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would upload the image to a server
    // and get a URL back. Here we'll use a placeholder.
    const imageUrl = therapistImageFile 
      ? URL.createObjectURL(therapistImageFile) 
      : '/placeholder.svg';
    
    const therapistToAdd: Therapist = {
      id: therapists.length + 1,
      ...newTherapist,
      image: imageUrl
    };
    
    setTherapists([...therapists, therapistToAdd]);
    setShowNewTherapistDialog(false);
    
    // Reset form
    setNewTherapist({
      name: '',
      specialty: '',
      experience: 0,
      bio: ''
    });
    setTherapistImageFile(null);
    
    toast({
      title: "מטפל נוסף",
      description: "המטפל נוסף בהצלחה לרשימת המטפלים",
    });
  };

  // Handle therapist removal
  const handleRemoveTherapist = () => {
    if (selectedTherapist !== null) {
      setTherapists(therapists.filter(t => t.id !== selectedTherapist));
      setSelectedTherapist(null);
      setShowRemoveTherapistDialog(false);
      
      toast({
        title: "מטפל הוסר",
        description: "המטפל הוסר בהצלחה מרשימת המטפלים",
      });
    }
  };

  // Add new gallery image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש לבחור תמונה להעלאה",
      });
      return;
    }
    
    // In a real app, we would upload the image to a server
    const imageUrl = URL.createObjectURL(imageFile);
    
    const imageToAdd: GalleryImage = {
      id: gallery.length + 1,
      url: imageUrl,
      title: newImage.title
    };
    
    setGallery([...gallery, imageToAdd]);
    setShowNewImageDialog(false);
    
    // Reset form
    setNewImage({ title: '' });
    setImageFile(null);
    
    toast({
      title: "תמונה נוספה",
      description: "התמונה נוספה בהצלחה לגלריה",
    });
  };
  
  // Remove gallery image
  const handleRemoveImage = (id: number) => {
    setGallery(gallery.filter(img => img.id !== id));
    
    toast({
      title: "תמונה הוסרה",
      description: "התמונה הוסרה בהצלחה מהגלריה",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">ניהול דף המכון</h1>
              <p className="text-gray-600 mt-1">ניהול המטפלים, גלריית תמונות וביקורות</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/dashboard">
                <Button variant="outline">חזרה ללוח הבקרה</Button>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="therapists" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="therapists">מטפלים</TabsTrigger>
              <TabsTrigger value="gallery">גלריה</TabsTrigger>
              <TabsTrigger value="reviews">ביקורות</TabsTrigger>
            </TabsList>
            
            {/* Therapists Tab */}
            <TabsContent value="therapists" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>ניהול מטפלים</CardTitle>
                  <Button onClick={() => setShowNewTherapistDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף מטפל
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {therapists.map(therapist => (
                      <Card key={therapist.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 bg-gray-100 p-4 flex items-center justify-center relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {therapist.image === '/placeholder.svg' ? (
                                <User className="h-12 w-12 text-gray-500" />
                              ) : (
                                <img 
                                  src={therapist.image} 
                                  alt={therapist.name} 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer">
                                <Upload className="h-6 w-6 text-white" />
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleTherapistImageUpload(therapist.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="md:w-2/3 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{therapist.name}</h3>
                                <p className="text-gray-700">
                                  {therapist.specialty}, {therapist.experience} שנות ניסיון
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedTherapist(therapist.id);
                                  setShowRemoveTherapistDialog(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-gray-600 mt-2 text-sm">{therapist.bio}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {therapists.length === 0 && (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">אין מטפלים</h3>
                      <p className="text-gray-600">הוסף מטפלים כדי שלקוחות יוכלו לראות אותם</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Gallery Tab */}
            <TabsContent value="gallery" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>גלריית תמונות</CardTitle>
                  <Button onClick={() => setShowNewImageDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף תמונה
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {gallery.map(image => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="mt-2 text-sm font-medium text-center">{image.title}</p>
                      </div>
                    ))}
                  </div>
                  
                  {gallery.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">אין תמונות בגלריה</h3>
                      <p className="text-gray-600">הוסף תמונות כדי שלקוחות יוכלו לצפות במתקני המכון</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ניהול ביקורות</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold text-lg ml-2">{review.customerName}</h3>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mt-2">{review.text}</p>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length === 0 && (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-1">אין ביקורות</h3>
                        <p className="text-gray-600">ביקורות יופיעו כאן כאשר לקוחות יוסיפו אותן</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* New Therapist Dialog */}
      <Dialog open={showNewTherapistDialog} onOpenChange={setShowNewTherapistDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>הוספת מטפל חדש</DialogTitle>
            <DialogDescription>
              הוסף את פרטי המטפל החדש.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddTherapist} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="therapistName">שם המטפל</Label>
                <Input 
                  id="therapistName" 
                  value={newTherapist.name}
                  onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="specialty">התמחות</Label>
                <Input 
                  id="specialty" 
                  value={newTherapist.specialty}
                  onChange={(e) => setNewTherapist({...newTherapist, specialty: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="experience">שנות ניסיון</Label>
                <Input 
                  id="experience" 
                  type="number"
                  value={newTherapist.experience.toString()}
                  onChange={(e) => setNewTherapist({...newTherapist, experience: Number(e.target.value)})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">ביוגרפיה</Label>
                <Textarea 
                  id="bio" 
                  rows={3}
                  value={newTherapist.bio}
                  onChange={(e) => setNewTherapist({...newTherapist, bio: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="therapistImage">תמונה</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      id="therapistImage" 
                      type="file"
                      onChange={handleTherapistImageChange}
                      accept="image/*"
                    />
                  </div>
                  {therapistImageFile && (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={URL.createObjectURL(therapistImageFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">מומלץ: תמונה בגודל 400x400 פיקסלים</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewTherapistDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">הוסף מטפל</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Remove Therapist Dialog */}
      <Dialog open={showRemoveTherapistDialog} onOpenChange={setShowRemoveTherapistDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>הסרת מטפל</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך להסיר את המטפל?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 py-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveTherapistDialog(false)}
            >
              ביטול
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveTherapist}
            >
              הסר מטפל
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* New Image Dialog */}
      <Dialog open={showNewImageDialog} onOpenChange={setShowNewImageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>הוספת תמונה לגלריה</DialogTitle>
            <DialogDescription>
              העלה תמונה חדשה לגלריית המכון.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddImage} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imageTitle">כותרת התמונה</Label>
                <Input 
                  id="imageTitle" 
                  value={newImage.title}
                  onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="galleryImage">בחר תמונה</Label>
                <div className="flex flex-col gap-4">
                  <Input 
                    id="galleryImage" 
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    required
                  />
                  
                  {imageFile && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">מומלץ: תמונה באיכות גבוהה בפורמט אופקי</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewImageDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">הוסף תמונה</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default UserPageManagement;
