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
import { useData } from '@/contexts/DataContext';
import { dbOperations } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { User, Image as ImageIcon, Star, Plus, X, Upload } from 'lucide-react';

// Types for gallery
interface GalleryImage {
  id: string;
  url: string;
  title: string;
}

// Types for therapist
interface Therapist {
  id: string;
  name: string;
  experience: string;
  bio: string;
  image?: string;
}

const UserPageManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const { reviews } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  // Load therapists from database
  useEffect(() => {
    const loadTherapists = async () => {
      if (!user?.id) return;
      
      try {
        // Get user's institutes
        const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
        
        if (userInstitutes.length > 0) {
          // Get therapists for the first institute (or combine from all institutes)
          const instituteTherapists = await dbOperations.getTherapistsByInstitute(userInstitutes[0].id);
          
          // Transform database therapists to match component interface
          const transformedTherapists = instituteTherapists.map((therapist) => ({
            id: therapist.id, // Use actual database ID to prevent duplicates
            name: therapist.name,
            experience: therapist.experience || '0',
            bio: therapist.bio || 'מטפל מוסמך',
            image: therapist.image_url || '/placeholder.svg'
          }));
          
          setTherapists(transformedTherapists);
        }
      } catch (error) {
        console.error('Error loading therapists:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את רשימת המטפלים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTherapists();
    loadGallery();
  }, [user?.id, toast]);

  // Load gallery from database
  const loadGallery = async () => {
    if (!user?.id) return;
    
    try {
      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      
      if (userInstitutes.length > 0) {
        // Get gallery images for the first institute
        const galleryImages = await dbOperations.getGalleryImagesByInstitute(userInstitutes[0].id);
        
        // Transform database images to match component interface
        const transformedImages = galleryImages.map((image) => ({
          id: image.id, // Use full UUID as string
          url: image.image_url,
          title: image.category || 'תמונה'
        }));
        
        setGallery(transformedImages);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את גלריית התמונות",
        variant: "destructive",
      });
    }
  };
  
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  // Dialog states
  const [showNewTherapistDialog, setShowNewTherapistDialog] = useState(false);
  const [showNewImageDialog, setShowNewImageDialog] = useState(false);
  
  // Selected therapist for removal
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [showRemoveTherapistDialog, setShowRemoveTherapistDialog] = useState(false);
  
  // Form states
  const [newTherapist, setNewTherapist] = useState<Omit<Therapist, 'id'>>({
    name: '',
    experience: '',
    bio: ''
  });
  
  const [newImage, setNewImage] = useState<Omit<GalleryImage, 'id' | 'url'>>({
    title: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [therapistImageFile, setTherapistImageFile] = useState<File | null>(null);

  // Handle therapist image upload for existing therapists
  const handleTherapistImageUpload = async (therapistId: string, file: File) => {
    try {
      // Get file extension from the actual file
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast({
          title: "שגיאה",
          description: "סוג קובץ לא נתמך. אנא בחר תמונה בפורמט JPG, PNG, GIF או WebP",
          variant: "destructive",
        });
        return;
      }
      
      // For now, we'll use a placeholder URL since we don't have file upload
      // In a real implementation, you would upload the file to a storage service
      const imageUrl = `/therapists/${therapistId}-${Date.now()}.${fileExtension}`;
      
      // Update in database
      await dbOperations.updateTherapist(therapistId, { image_url: imageUrl });
      
      // Update local state
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
    } catch (error) {
      console.error('Error updating therapist image:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את תמונת המטפל",
        variant: "destructive",
      });
    }
  };

  // Handle gallery image upload for existing images
  const handleGalleryImageUpload = (imageId: number, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    
    setGallery(prevGallery => 
      prevGallery.map(image => 
        image.id === imageId 
          ? { ...image, url: imageUrl }
          : image
      )
    );
    
    toast({
      title: "תמונה עודכנה",
      description: "תמונת הגלריה עודכנה בהצלחה",
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
  const handleAddTherapist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף מטפל ללא התחברות",
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
          description: "לא נמצא מכון לשיוך המטפל",
          variant: "destructive",
        });
        return;
      }

      // Get file extension from the actual file if provided
      let imageUrl = '/placeholder.svg';
      if (therapistImageFile) {
        const fileExtension = therapistImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (!allowedExtensions.includes(fileExtension)) {
          toast({
            title: "שגיאה",
            description: "סוג קובץ לא נתמך. אנא בחר תמונה בפורמט JPG, PNG, GIF או WebP",
            variant: "destructive",
          });
          return;
        }
        
        imageUrl = `/therapists/placeholder-${Date.now()}.${fileExtension}`;
      }
      
      // Save to database
      const savedTherapist = await dbOperations.createTherapist({
        institute_id: userInstitutes[0].id,
        name: newTherapist.name,
        experience: newTherapist.experience,
        bio: newTherapist.bio,
        image_url: imageUrl
      });
      
      // Add to local state
      const therapistToAdd: Therapist = {
        id: savedTherapist.id,
        name: savedTherapist.name,
        experience: savedTherapist.experience || '0',
        bio: savedTherapist.bio || 'מטפל מוסמך',
        image: savedTherapist.image_url
      };
      
      setTherapists([...therapists, therapistToAdd]);
      setShowNewTherapistDialog(false);
      
      // Reset form
      setNewTherapist({
        name: '',
        experience: '',
        bio: ''
      });
      setTherapistImageFile(null);
      
      toast({
        title: "מטפל נוסף",
        description: "המטפל נוסף בהצלחה",
      });
    } catch (error) {
      console.error('Error adding therapist:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את המטפל",
        variant: "destructive",
      });
    }
  };

  // Handle therapist removal
  const handleRemoveTherapist = async () => {
    if (selectedTherapist !== null) {
      try {
        // Delete from database
        await dbOperations.deleteTherapist(selectedTherapist);
        
        // Update local state
        setTherapists(therapists.filter(therapist => therapist.id !== selectedTherapist));
        setSelectedTherapist(null);
        setShowRemoveTherapistDialog(false);
        
        toast({
          title: "מטפל הוסר",
          description: "המטפל הוסר בהצלחה",
        });
      } catch (error) {
        console.error('Error removing therapist:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן להסיר את המטפל",
          variant: "destructive",
        });
      }
    }
  };

  // Add new gallery image
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !user?.id) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש לבחור תמונה להעלאה",
      });
      return;
    }
    
    try {
      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      
      if (userInstitutes.length === 0) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא נמצא מכון לשיוך התמונה",
        });
        return;
      }
      
      // Get file extension from the actual file
      const fileExtension = imageFile?.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast({
          title: "שגיאה",
          description: "סוג קובץ לא נתמך. אנא בחר תמונה בפורמט JPG, PNG, GIF או WebP",
          variant: "destructive",
        });
        return;
      }
      
      // For now, we'll use a placeholder URL since we don't have file upload
      // In a real app, you would upload the file to a server first
      const imageUrl = `/lovable-uploads/placeholder-${Date.now()}.${fileExtension}`;
      
      // Save to database
      const savedImage = await dbOperations.createGalleryImage({
        institute_id: userInstitutes[0].id,
        image_url: imageUrl,
        category: newImage.title
      });
      
      // Add to local state
      const imageToAdd: GalleryImage = {
        id: savedImage.id, // Use full UUID as string
        url: savedImage.image_url,
        title: savedImage.category || newImage.title
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
    } catch (error) {
      console.error('Error adding gallery image:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן להוסיף את התמונה",
      });
    }
  };
  
  // Remove gallery image
  const handleRemoveImage = async (id: string) => {
    try {
      // Delete from database using the UUID directly
      await dbOperations.deleteGalleryImage(id);
      
      // Reload gallery from database to ensure consistency
      await loadGallery();
      
      toast({
        title: "תמונה הוסרה",
        description: "התמונה הוסרה בהצלחה מהגלריה",
      });
    } catch (error) {
      console.error('Error removing gallery image:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן להסיר את התמונה",
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
                               {!therapist.image ? (
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
                                   {therapist.experience} שנות ניסיון
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
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                          <img 
                            src={image.url} 
                            alt={image.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer mr-2">
                              <Upload className="h-6 w-6 text-white" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleGalleryImageUpload(image.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
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
            
            {/* Reviews Tab - Updated to show actual reviews from DataContext */}
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
                            <p className="text-sm text-gray-500 mt-1">מטפל: {review.therapistName}</p>
                            <p className="text-gray-600 mt-2">{review.reviewText}</p>
                          </div>
                          <span className="text-sm text-gray-500">{review.submittedAt.toLocaleDateString('he-IL')}</span>
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
                <Label htmlFor="experience">שנות ניסיון</Label>
                <Input 
                  id="experience" 
                  value={newTherapist.experience}
                  onChange={(e) => setNewTherapist({...newTherapist, experience: e.target.value})}
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
