
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, X, Edit, Save, MapPin, Building, Phone, Upload, Camera } from 'lucide-react';
import { dbOperations } from '@/lib/database';

// Database entity interfaces
interface Workshop {
  id: string;
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
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface InstituteInfo {
  id: string;
  institute_name: string;
  address?: string;
  service_name?: string;
  image_url?: string;
  image_data?: string;
  image_mime_type?: string;
}

interface CoordinatesInfo {
  latitude: number;
  longitude: number;
  address_verified: boolean;
}

const StoreManagement = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Workshops state - now loaded from database
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  
  // Services state - now loaded from database
  const [services, setServices] = useState<Service[]>([]);
  
  // Benefits state - for loyalty benefits
  const [benefits, setBenefits] = useState<Service[]>([]);
  
  // Products state - for physical products
  const [products, setProducts] = useState<Service[]>([]);
  
  // Business hours state - now loaded from database
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  
  // Institute info state
  const [instituteInfo, setInstituteInfo] = useState<InstituteInfo | null>(null);
  const [coordinatesInfo, setCoordinatesInfo] = useState<CoordinatesInfo | null>(null);

  // Dialog states
  const [showNewWorkshopDialog, setShowNewWorkshopDialog] = useState(false);
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [showNewBenefitDialog, setShowNewBenefitDialog] = useState(false);
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [showEditHoursDialog, setShowEditHoursDialog] = useState(false);
  const [showEditInstituteDialog, setShowEditInstituteDialog] = useState(false);
  const [showEditCoordinatesDialog, setShowEditCoordinatesDialog] = useState(false);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteInstituteDialog, setShowDeleteInstituteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
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
  
  const [newBenefit, setNewBenefit] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: ''
  });
  
  const [newProduct, setNewProduct] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: ''
  });
  
  const [editingHours, setEditingHours] = useState<BusinessHours[]>([]);
  
  const [editingInstitute, setEditingInstitute] = useState<InstituteInfo>({
    id: '',
    institute_name: '',
    address: '',
    service_name: '',
    image_url: ''
  });
  
  const [editingCoordinates, setEditingCoordinates] = useState<CoordinatesInfo>({
    latitude: 0,
    longitude: 0,
    address_verified: false
  });

  // Institute image state
  const [instituteImage, setInstituteImage] = useState<string>('/placeholder.svg');

  // Wait for authentication check to complete before redirecting
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'provider')) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Load data from database
  useEffect(() => {
    console.log('useEffect triggered, isAuthenticated:', isAuthenticated, 'user:', user);
    const loadData = async () => {
      console.log('loadData called, user:', user?.id);
      if (!user?.id) {
        console.log('No user ID, returning early');
        return;
      }

      // Get user's institutes
      const userInstitutes = await dbOperations.getInstitutesByOwner(user.id);
      console.log('userInstitutes:', userInstitutes);
      if (userInstitutes.length === 0) {
        // No institutes found - redirect to institute setup
        console.log('No institutes found, redirecting to setup');
        navigate('/institute-setup');
        return;
      }

      try {

        const instituteId = userInstitutes[0].id;

        // Load workshops
        const workshopsData = await dbOperations.getWorkshopsByInstitute(instituteId);
        const transformedWorkshops = (workshopsData as any[]).map((workshop: any) => ({
          id: workshop.id, // Use full UUID as string
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

        // Load services (only type='service')
        const servicesData = await dbOperations.getServicesByInstitute(instituteId);
        const transformedServices = (servicesData as any[]).map((service: any) => ({
          id: service.id, // Use full UUID as string
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration
        }));
        setServices(transformedServices);

        // Load benefits (type='benefit')
        const benefitsData = await dbOperations.getBenefitsByInstitute(instituteId);
        const transformedBenefits = benefitsData.map((benefit: any) => ({
          id: benefit.id,
          name: benefit.name,
          description: benefit.description,
          price: benefit.price,
          duration: benefit.duration || 'הטבה'
        }));
        setBenefits(transformedBenefits);

        // Load products (type='product')
        const productsData = await dbOperations.getProductsByInstitute(instituteId);
        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          duration: product.duration || 'מוצר'
        }));
        setProducts(transformedProducts);

        // Load business hours
        const businessHoursData = await dbOperations.getBusinessHoursByInstitute(instituteId);
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const transformedHours = dayNames.map((day, index) => {
          const dayData = (businessHoursData as any[]).find((bh: any) => bh.day_of_week === index);
          if (dayData && dayData.is_open) {
            return {
              day,
              hours: `${dayData.open_time} - ${dayData.close_time}`,
              isOpen: true,
              openTime: dayData.open_time || '08:00',
              closeTime: dayData.close_time || '20:00'
            };
          } else {
            return {
              day,
              hours: 'סגור',
              isOpen: false,
              openTime: '08:00',
              closeTime: '20:00'
            };
          }
        });
        setBusinessHours(transformedHours);
        setEditingHours(transformedHours);

        // Load institute information
        const instituteData = userInstitutes[0];
        console.log('Setting instituteInfo:', instituteData);
        setInstituteInfo(instituteData);
        
        // Don't include image_data in editingInstitute - it's handled separately
        const { image_data, image_mime_type, ...editableData } = instituteData;
        setEditingInstitute(editableData);

        // Load institute image - now comes directly with image_data from API
        if (instituteData.image_data && instituteData.image_data !== 'null') {
          // Use image_data if available (already base64 encoded)
          const mimeType = instituteData.image_mime_type || 'image/jpeg';
          setInstituteImage(`data:${mimeType};base64,${instituteData.image_data}`);
        } else if (instituteData.image_url) {
          // Fallback to image_url
          setInstituteImage(instituteData.image_url);
        } else {
          setInstituteImage('/placeholder.svg');
        }

        // Load coordinates information
        const coordinatesData = await dbOperations.getInstituteCoordinates(instituteId);
        console.log('Loaded coordinates data:', coordinatesData);
        if (coordinatesData) {
          // Ensure latitude and longitude are numbers
          const processedCoordinates = {
            ...coordinatesData,
            latitude: Number(coordinatesData.latitude),
            longitude: Number(coordinatesData.longitude)
          };
          console.log('Processed coordinates:', processedCoordinates);
          setCoordinatesInfo(processedCoordinates);
          setEditingCoordinates(processedCoordinates);
        } else {
          console.log('No coordinates data found for institute:', instituteId);
        }

      } catch (error) {
        console.error('Error loading store data:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני החנות",
          variant: "destructive",
        });
        // Ensure instituteInfo is set even on error to prevent infinite loading
        if (userInstitutes.length > 0) {
          setInstituteInfo(userInstitutes[0]);
          const { image_data, image_mime_type, ...editableData } = userInstitutes[0];
          setEditingInstitute(editableData);
          setInstituteImage('/placeholder.svg');
        }
      }
    };

    if (isAuthenticated && user?.id) {
      loadData();
    }
  }, [user?.id, isAuthenticated, toast, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect if not authenticated or not a provider (after loading completes)
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

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

      // Convert date from DD/MM/YYYY to YYYY-MM-DD for PostgreSQL
      const convertDateFormat = (dateStr: string): string => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr; // Return as is if format is unexpected
      };

      const workshopData = {
        institute_id: userInstitutes[0].id,
        title: newWorkshop.title,
        description: newWorkshop.description,
        workshop_date: convertDateFormat(newWorkshop.date),
        workshop_time: newWorkshop.time,
        duration: newWorkshop.duration,
        price: newWorkshop.price,
        max_participants: newWorkshop.maxParticipants
      };

      const savedWorkshop = await dbOperations.createWorkshop(workshopData);
      
      // Add to local state
      const workshopToAdd: Workshop = {
        id: (savedWorkshop as any).id, // Use full UUID as string
        title: (savedWorkshop as any).title,
        description: (savedWorkshop as any).description,
        date: new Date((savedWorkshop as any).workshop_date).toLocaleDateString('he-IL'),
        time: (savedWorkshop as any).workshop_time,
        duration: `${(savedWorkshop as any).duration} דקות`,
        price: (savedWorkshop as any).price,
        maxParticipants: (savedWorkshop as any).max_participants,
        currentParticipants: 0
      };
      
      // Reload workshops from database to ensure consistency
      const updatedWorkshopsData = await dbOperations.getWorkshopsByInstitute(userInstitutes[0].id);
      const updatedTransformedWorkshops = (updatedWorkshopsData as any[]).map((workshop: any) => ({
        id: workshop.id, // Use full UUID as string
        title: workshop.title,
        description: workshop.description,
        date: new Date(workshop.workshop_date).toLocaleDateString('he-IL'),
        time: workshop.workshop_time,
        duration: `${workshop.duration} דקות`,
        price: workshop.price,
        maxParticipants: workshop.max_participants,
        currentParticipants: workshop.current_participants
      }));
      
      setWorkshops(updatedTransformedWorkshops);
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
        id: (savedService as any).id, // Use full UUID as string
        name: (savedService as any).name,
        description: (savedService as any).description,
        price: (savedService as any).price,
        duration: (savedService as any).duration
      };
      
      // Reload services from database to ensure consistency
      const updatedServicesData = await dbOperations.getServicesByInstitute(userInstitutes[0].id);
      const updatedTransformedServices = (updatedServicesData as any[]).map((service: any) => ({
        id: service.id, // Use full UUID as string
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration
      }));
      
      setServices(updatedTransformedServices);
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
          // Use the separate openTime and closeTime fields
          const businessHoursData = {
            institute_id: instituteId,
            day_of_week: dayIndex,
            open_time: dayHours.openTime || '08:00',
            close_time: dayHours.closeTime || '20:00',
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
      
      // Reload business hours from database to ensure consistency
      const updatedBusinessHoursData = await dbOperations.getBusinessHoursByInstitute(instituteId);
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      const updatedTransformedHours = dayNames.map((day, index) => {
        const dayData = (updatedBusinessHoursData as any[]).find((bh: any) => bh.day_of_week === index);
        if (dayData && dayData.is_open) {
          return {
            day,
            hours: `${dayData.open_time} - ${dayData.close_time}`,
            isOpen: true,
            openTime: dayData.open_time || '08:00',
            closeTime: dayData.close_time || '20:00'
          };
        } else {
          return {
            day,
            hours: 'סגור',
            isOpen: false,
            openTime: '08:00',
            closeTime: '20:00'
          };
        }
      });
      
      console.log('Updating business hours state:', updatedTransformedHours);
      
      // Update the state with new data
      setBusinessHours([...updatedTransformedHours]);
      setEditingHours([...updatedTransformedHours]);
      
      // Close dialog and show success message
      setTimeout(() => {
        setShowEditHoursDialog(false);
        toast({
          title: "שעות פעילות עודכנו",
          description: "שעות הפעילות של העסק עודכנו בהצלחה",
        });
      }, 100);
    } catch (error) {
      console.error('Error updating business hours:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את שעות הפעילות",
        variant: "destructive",
      });
    }
  };

  // Handle adding new benefit
  const handleAddBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף הטבה ללא התחברות",
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
          description: "לא נמצא מכון להוספת ההטבה",
          variant: "destructive",
        });
        return;
      }

      const instituteId = userInstitutes[0].id;

      // Create benefit data for database
      const benefitData = {
        institute_id: instituteId,
        name: newBenefit.name,
        description: newBenefit.description,
        price: newBenefit.price,
        duration: 'הטבה'
      };

      // Save to database
      const savedBenefit = await dbOperations.createBenefit(benefitData);
      
      // Reload benefits from database to ensure consistency
      const updatedBenefitsData = await dbOperations.getBenefitsByInstitute(instituteId);
      const updatedTransformedBenefits = updatedBenefitsData.map((benefit: any) => ({
        id: benefit.id,
        name: benefit.name,
        description: benefit.description,
        price: benefit.price,
        duration: benefit.duration || 'הטבה'
      }));
      
      setBenefits(updatedTransformedBenefits);
      setShowNewBenefitDialog(false);
      
      // Reset form
      setNewBenefit({
        name: '',
        description: '',
        price: 0,
        duration: ''
      });
      
      toast({
        title: "הטבה נוספה",
        description: "ההטבה נוספה בהצלחה למסד הנתונים",
      });
    } catch (error) {
      console.error('Error adding benefit:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את ההטבה",
        variant: "destructive",
      });
    }
  };

  // Handle adding new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף מוצר ללא התחברות",
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
          description: "לא נמצא מכון להוספת המוצר",
          variant: "destructive",
        });
        return;
      }

      const instituteId = userInstitutes[0].id;

      // Create product data for database
      const productData = {
        institute_id: instituteId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        duration: 'מוצר'
      };

      // Save to database
      const savedProduct = await dbOperations.createProduct(productData);
      
      // Reload products from database to ensure consistency
      const updatedProductsData = await dbOperations.getProductsByInstitute(instituteId);
      const updatedTransformedProducts = updatedProductsData.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        duration: product.duration || 'מוצר'
      }));
      
      setProducts(updatedTransformedProducts);
      setShowNewProductDialog(false);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        duration: ''
      });
      
      toast({
        title: "מוצר נוסף",
        description: "המוצר נוסף בהצלחה למסד הנתונים",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את המוצר",
        variant: "destructive",
      });
    }
  };

  // Handle institute image upload
  const handleInstituteImageUpload = async (file: File) => {
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "שגיאה",
          description: "הקובץ גדול מדי. גודל מקסימלי: 5MB",
          variant: "destructive",
        });
        return;
      }

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

      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          const mimeType = file.type;
          const imageUrl = null; // Don't store URL, only binary data

          // Extract just the base64 part (remove data:image/jpeg;base64, prefix)
          const base64Only = base64Data.split(',')[1];

          console.log('Uploading image:');
          console.log('- Institute ID:', instituteInfo?.id);
          console.log('- MIME type:', mimeType);
          console.log('- Base64 length:', base64Only.length);
          console.log('- Image URL:', imageUrl);
          console.log('- First 30 chars of base64:', base64Only.substring(0, 30));

          // Upload image data to database
          console.log('Calling uploadImage...');
          const result = await dbOperations.uploadImage('institutes', instituteInfo?.id || '', base64Only, mimeType, imageUrl);
          console.log('Upload result:', result);
          console.log('Upload successful!');
          
          // Verify the upload by refetching
          console.log('Verifying upload by refetching institute data...');
          const verifyInstitutes = await dbOperations.getInstitutesByOwner(user?.id || '');
          console.log('Refetched institute:', verifyInstitutes[0]);

          // Update local state immediately with the uploaded data
          setInstituteImage(base64Data);
          
          toast({
            title: "תמונה עודכנה",
            description: "תמונת המכון נשמרה בהצלחה במסד הנתונים",
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            error: error
          });
          toast({
            title: "שגיאה",
            description: `לא ניתן לשמור את תמונת המכון: ${error.message || 'שגיאה לא ידועה'}`,
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error updating institute image:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את תמונת המכון",
        variant: "destructive",
      });
    }
  };

  // Handle institute image selection
  const handleInstituteImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInstituteImageUpload(e.target.files[0]);
    }
  };

  // Handle updating institute information
  const handleUpdateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !instituteInfo?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן פרטי המכון ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if address has changed
      const addressChanged = instituteInfo.address !== editingInstitute.address;
      
      // Don't send image_data and image_mime_type - images are updated separately via uploadImage
      const { image_data, image_mime_type, ...instituteDataToUpdate } = editingInstitute;
      
      const updatedInstitute = await dbOperations.updateInstitute(instituteInfo.id, instituteDataToUpdate);
      
      if (updatedInstitute) {
        setInstituteInfo(updatedInstitute);
        
        // Update institute image from the updated data
        if (updatedInstitute.image_data && updatedInstitute.image_data !== 'null') {
          const mimeType = updatedInstitute.image_mime_type || 'image/jpeg';
          setInstituteImage(`data:${mimeType};base64,${updatedInstitute.image_data}`);
        } else if (updatedInstitute.image_url) {
          setInstituteImage(updatedInstitute.image_url);
        }
        
        // If address changed, try to update coordinates automatically
        if (addressChanged && editingInstitute.address) {
          try {
            console.log('Address changed, updating coordinates automatically...');
            const geocodingResult = await dbOperations.geocodeAddress(editingInstitute.address);
            
            const newCoordinates = {
              latitude: geocodingResult.latitude,
              longitude: geocodingResult.longitude,
              address_verified: true
            };
            
            let updatedCoordinates;
            if (coordinatesInfo) {
              // Update existing coordinates
              updatedCoordinates = await dbOperations.updateInstituteCoordinates(instituteInfo.id, newCoordinates);
            } else {
              // Create new coordinates
              updatedCoordinates = await dbOperations.createInstituteCoordinates({
                institute_id: instituteInfo.id,
                ...newCoordinates
              });
            }
            
            if (updatedCoordinates) {
              const processedCoordinates = {
                ...updatedCoordinates,
                latitude: Number(updatedCoordinates.latitude),
                longitude: Number(updatedCoordinates.longitude)
              };
              setCoordinatesInfo(processedCoordinates);
              
              toast({
                title: "פרטי המכון והמיקום עודכנו",
                description: "פרטי המכון והקואורדינטות עודכנו בהצלחה",
              });
            }
          } catch (geocodingError) {
            console.warn('Geocoding failed during institute update:', geocodingError);
            toast({
              title: "פרטי המכון עודכנו",
              description: "פרטי המכון עודכנו, אך לא ניתן לעדכן את המיקום אוטומטית. עדכן ידנית במידת הצורך",
            });
          }
        } else {
          toast({
            title: "פרטי המכון עודכנו",
            description: "פרטי המכון עודכנו בהצלחה",
          });
        }
        
        setShowEditInstituteDialog(false);
      }
    } catch (error) {
      console.error('Error updating institute:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את פרטי המכון",
        variant: "destructive",
      });
    }
  };

  // Handle updating coordinates
  const handleUpdateCoordinates = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !instituteInfo?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן מיקום המכון ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving coordinates:', editingCoordinates);
      let updatedCoordinates;
      
      if (coordinatesInfo) {
        // Update existing coordinates
        console.log('Updating existing coordinates for institute:', instituteInfo.id);
        updatedCoordinates = await dbOperations.updateInstituteCoordinates(instituteInfo.id, editingCoordinates);
      } else {
        // Create new coordinates
        console.log('Creating new coordinates for institute:', instituteInfo.id);
        updatedCoordinates = await dbOperations.createInstituteCoordinates({
          institute_id: instituteInfo.id,
          latitude: editingCoordinates.latitude,
          longitude: editingCoordinates.longitude,
          address_verified: editingCoordinates.address_verified
        });
      }
      
      console.log('Updated coordinates result:', updatedCoordinates);
      
      if (updatedCoordinates) {
        // Ensure latitude and longitude are numbers
        const processedCoordinates = {
          ...updatedCoordinates,
          latitude: Number(updatedCoordinates.latitude),
          longitude: Number(updatedCoordinates.longitude)
        };
        setCoordinatesInfo(processedCoordinates);
        setShowEditCoordinatesDialog(false);
        
        toast({
          title: "מיקום המכון עודכן",
          description: "מיקום המכון עודכן בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error updating coordinates:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את מיקום המכון",
        variant: "destructive",
      });
    }
  };

  // Handle deleting institute
  const handleDeleteInstitute = async () => {
    if (!user?.id || !instituteInfo?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המכון ללא התחברות",
        variant: "destructive",
      });
      return;
    }

    if (deleteConfirmationText !== 'מחק מכון') {
      toast({
        title: "שגיאה",
        description: "אנא הקלד 'מחק מכון' לאישור המחיקה",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete institute from database
      await dbOperations.deleteInstitute(instituteInfo.id);
      
      toast({
        title: "מכון נמחק",
        description: "המכון נמחק בהצלחה מהמערכת",
      });
      
      // Redirect to institute setup
      navigate('/institute-setup');
    } catch (error) {
      console.error('Error deleting institute:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המכון",
        variant: "destructive",
      });
    }
  };

  // Handle editing service
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowEditServiceDialog(true);
  };

  // Handle updating service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService || !instituteInfo?.id) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן שירות ללא פרטים מלאים",
        variant: "destructive",
      });
      return;
    }

    try {
      await dbOperations.updateService(editingService.id, {
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration: editingService.duration
      });
      
      // Update local state
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === editingService.id ? editingService : service
        )
      );
      
      setShowEditServiceDialog(false);
      setEditingService(null);
      
      toast({
        title: "שירות עודכן",
        description: "השירות עודכן בהצלחה",
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את השירות",
        variant: "destructive",
      });
    }
  };

  // Handle deleting service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את השירות?')) {
      return;
    }

    try {
      await dbOperations.deleteService(serviceId);
      
      // Update local state
      setServices(prevServices => 
        prevServices.filter(service => service.id !== serviceId)
      );
      
      toast({
        title: "שירות נמחק",
        description: "השירות נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את השירות",
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
          
          <Tabs defaultValue="institute" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="institute">פרטי המכון</TabsTrigger>
              <TabsTrigger value="workshops">סדנאות</TabsTrigger>
              <TabsTrigger value="hours">שעות פעילות</TabsTrigger>
              <TabsTrigger value="pricing">מחירון</TabsTrigger>
            </TabsList>
            
            {/* Institute Information Tab */}
            <TabsContent value="institute" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>פרטי המכון</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingCoordinates(coordinatesInfo || {
                          latitude: 0,
                          longitude: 0,
                          address_verified: false
                        });
                        setShowEditCoordinatesDialog(true);
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" /> ערוך מיקום
                    </Button>
                    <Button onClick={() => {
                      // Don't include image_data and image_mime_type - they're handled separately
                      const { image_data, image_mime_type, ...instituteForEditing } = instituteInfo || {
                        id: '',
                        institute_name: '',
                        address: '',
                        service_name: '',
                        image_url: ''
                      };
                      setEditingInstitute(instituteForEditing);
                      setShowEditInstituteDialog(true);
                    }}>
                      <Edit className="mr-2 h-4 w-4" /> ערוך פרטים
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteInstituteDialog(true)}
                    >
                      <X className="mr-2 h-4 w-4" /> מחק מכון
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {instituteInfo ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Building className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">שם המכון</p>
                              <p className="font-medium">{instituteInfo.institute_name}</p>
                            </div>
                          </div>
                          
                          {instituteInfo.address && (
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <MapPin className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">כתובת</p>
                                <p className="font-medium">{instituteInfo.address}</p>
                              </div>
                            </div>
                          )}
                          
                          {instituteInfo.service_name && (
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <Building className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">סוג השירות</p>
                                <p className="font-medium">{instituteInfo.service_name}</p>
                              </div>
                            </div>
                          )}
                          
                          {coordinatesInfo && coordinatesInfo.latitude && coordinatesInfo.longitude && (
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <MapPin className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">מיקום</p>
                                <p className="font-medium">
                                  {Number(coordinatesInfo.latitude).toFixed(6)}, {Number(coordinatesInfo.longitude).toFixed(6)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {coordinatesInfo.address_verified ? 'כתובת מאומתת' : 'כתובת לא מאומתת'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={instituteImage} 
                            alt={instituteInfo.institute_name}
                            className="w-48 h-48 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">טוען פרטי המכון...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
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
                      <div key={`${day.day}-${day.hours}`} className="border border-gray-200 rounded-lg p-4">
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
              <div className="space-y-6">
                {/* Services Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>שירותים</CardTitle>
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
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{service.name}</h3>
                              <p className="text-gray-600 mt-1">{service.description}</p>
                              <p className="text-sm text-gray-500 mt-2">משך: {service.duration}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:mr-4 flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg">{service.price} ₪</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditService(service)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  ערוך
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteService(service.id)}
                                  className="flex items-center gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  מחק
                                </Button>
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

              {/* Benefits Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>הטבות</CardTitle>
                  <Button onClick={() => setShowNewBenefitDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף הטבה
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {benefits.length > 0 ? (
                      benefits.map(benefit => (
                        <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{benefit.name}</h3>
                              <p className="text-gray-600 mt-1">{benefit.description}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:mr-4">
                              <div className="bg-green-100 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg text-green-800">
                                  {benefit.price === 0 ? 'חינם' : `${benefit.price} ₪`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">אין הטבות כרגע. הוסף הטבות חדשות.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>מוצרים</CardTitle>
                  <Button onClick={() => setShowNewProductDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף מוצר
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {products.length > 0 ? (
                      products.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{product.name}</h3>
                              <p className="text-gray-600 mt-1">{product.description}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:mr-4">
                              <div className="bg-blue-100 p-3 rounded-lg text-center">
                                <p className="font-bold text-lg text-blue-800">{product.price} ₪</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">אין מוצרים כרגע. הוסף מוצרים חדשים.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>עריכת שעות פעילות</DialogTitle>
            <DialogDescription>
              עדכן את שעות הפעילות של העסק שלך.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateHours} className="space-y-4 py-4">
            <div className="space-y-4">
              {editingHours.map((day, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{day.day}</span>
                    <Button
                      type="button"
                      variant={day.isOpen ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const updated = [...editingHours];
                        updated[index].isOpen = !day.isOpen;
                        if (!day.isOpen) {
                          // Switching from closed to open
                          updated[index].openTime = '08:00';
                          updated[index].closeTime = '20:00';
                          updated[index].hours = '08:00 - 20:00';
                        } else {
                          // Switching from open to closed
                          updated[index].hours = 'סגור';
                        }
                        setEditingHours(updated);
                      }}
                    >
                      {day.isOpen ? 'פתוח' : 'סגור'}
                    </Button>
                  </div>
                  {day.isOpen && (
                    <div className="grid grid-cols-2 gap-3 mr-4 mt-2">
                      <TimePicker
                        label="משעה:"
                        value={day.openTime}
                        onChange={(time) => {
                          const updated = [...editingHours];
                          updated[index].openTime = time;
                          updated[index].hours = `${time} - ${updated[index].closeTime || '20:00'}`;
                          setEditingHours(updated);
                        }}
                        placeholder="בחר שעת פתיחה"
                      />
                      <TimePicker
                        label="עד שעה:"
                        value={day.closeTime}
                        onChange={(time) => {
                          const updated = [...editingHours];
                          updated[index].closeTime = time;
                          updated[index].hours = `${updated[index].openTime || '08:00'} - ${time}`;
                          setEditingHours(updated);
                        }}
                        placeholder="בחר שעת סגירה"
                        minTime={day.openTime}
                      />
                    </div>
                  )}
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

      {/* New Benefit Dialog */}
      <Dialog open={showNewBenefitDialog} onOpenChange={setShowNewBenefitDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>הוספת הטבה חדשה</DialogTitle>
            <DialogDescription>
              מלא את הפרטים להוספת הטבה חדשה למערכת.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddBenefit} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="benefit-name">שם ההטבה</Label>
                <Input 
                  id="benefit-name" 
                  value={newBenefit.name}
                  onChange={(e) => setNewBenefit({...newBenefit, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="benefit-description">תיאור ההטבה</Label>
                <Textarea 
                  id="benefit-description" 
                  value={newBenefit.description}
                  onChange={(e) => setNewBenefit({...newBenefit, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="benefit-price">מחיר (₪)</Label>
                <Input 
                  id="benefit-price" 
                  type="number" 
                  value={newBenefit.price}
                  onChange={(e) => setNewBenefit({...newBenefit, price: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewBenefitDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">הוסף הטבה</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>הוספת מוצר חדש</DialogTitle>
            <DialogDescription>
              מלא את הפרטים להוספת מוצר חדש למערכת.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddProduct} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name">שם המוצר</Label>
                <Input 
                  id="product-name" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="product-description">תיאור המוצר</Label>
                <Textarea 
                  id="product-description" 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="product-price">מחיר (₪)</Label>
                <Input 
                  id="product-price" 
                  type="number" 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewProductDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">הוסף מוצר</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Institute Dialog */}
      <Dialog open={showEditInstituteDialog} onOpenChange={setShowEditInstituteDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>עריכת פרטי המכון</DialogTitle>
            <DialogDescription>
              עדכן את פרטי המכון שלך.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateInstitute} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="institute-name">שם המכון</Label>
                <Input 
                  id="institute-name" 
                  value={editingInstitute.institute_name}
                  onChange={(e) => setEditingInstitute({...editingInstitute, institute_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="institute-address">כתובת</Label>
                <Textarea 
                  id="institute-address" 
                  rows={3}
                  value={editingInstitute.address || ''}
                  onChange={(e) => setEditingInstitute({...editingInstitute, address: e.target.value})}
                  placeholder="הזן את כתובת המכון"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service-name">סוג השירות</Label>
                <Input 
                  id="service-name" 
                  value={editingInstitute.service_name || ''}
                  onChange={(e) => setEditingInstitute({...editingInstitute, service_name: e.target.value})}
                  placeholder="למשל: מכון קרח, סאונה, עיסוי"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="institute-image">תמונת המכון</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center relative group overflow-hidden border-2 border-dashed border-gray-300">
                    <img 
                      src={instituteImage} 
                      alt="Institute" 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleInstituteImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">העלה תמונה למכון שלך</p>
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 ml-2" />
                          בחר תמונה
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleInstituteImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">תומך בפורמטים: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditInstituteDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">שמור שינויים</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Coordinates Dialog */}
      <Dialog open={showEditCoordinatesDialog} onOpenChange={setShowEditCoordinatesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>עריכת מיקום המכון</DialogTitle>
            <DialogDescription>
              עדכן את הקואורדינטות של המכון שלך.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateCoordinates} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">קו רוחב (Latitude)</Label>
                  <Input 
                    id="latitude" 
                    type="number"
                    step="0.000001"
                    value={editingCoordinates.latitude}
                    onChange={(e) => setEditingCoordinates({...editingCoordinates, latitude: parseFloat(e.target.value) || 0})}
                    placeholder="32.0853"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="longitude">קו אורך (Longitude)</Label>
                  <Input 
                    id="longitude" 
                    type="number"
                    step="0.000001"
                    value={editingCoordinates.longitude}
                    onChange={(e) => setEditingCoordinates({...editingCoordinates, longitude: parseFloat(e.target.value) || 0})}
                    placeholder="34.7818"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="address-verified"
                  checked={editingCoordinates.address_verified}
                  onChange={(e) => setEditingCoordinates({...editingCoordinates, address_verified: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="address-verified">כתובת מאומתת</Label>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>טיפ: השתמש ב-Google Maps כדי למצוא את הקואורדינטות המדויקות של המכון שלך.</p>
                <p>לחץ לחיצה ימנית על המיקום ב-Google Maps ובחר "מה הקואורדינטות?"</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditCoordinatesDialog(false)}
              >
                ביטול
              </Button>
              <Button type="submit">שמור מיקום</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditServiceDialog} onOpenChange={setShowEditServiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>עריכת שירות</DialogTitle>
            <DialogDescription>
              עדכן את פרטי השירות.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateService} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-name">שם השירות</Label>
                <Input 
                  id="edit-service-name" 
                  value={editingService?.name || ''}
                  onChange={(e) => setEditingService(editingService ? {...editingService, name: e.target.value} : null)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-service-description">תיאור</Label>
                <Textarea 
                  id="edit-service-description" 
                  rows={3}
                  value={editingService?.description || ''}
                  onChange={(e) => setEditingService(editingService ? {...editingService, description: e.target.value} : null)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-service-price">מחיר (₪)</Label>
                  <Input 
                    id="edit-service-price" 
                    type="number"
                    value={editingService?.price || 0}
                    onChange={(e) => setEditingService(editingService ? {...editingService, price: Number(e.target.value)} : null)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-service-duration">משך</Label>
                  <Input 
                    id="edit-service-duration" 
                    value={editingService?.duration || ''}
                    onChange={(e) => setEditingService(editingService ? {...editingService, duration: e.target.value} : null)}
                    placeholder="למשל: 60 דקות"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditServiceDialog(false);
                  setEditingService(null);
                }}
              >
                ביטול
              </Button>
              <Button type="submit">שמור שינויים</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Institute Dialog */}
      <Dialog open={showDeleteInstituteDialog} onOpenChange={setShowDeleteInstituteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">מחיקת מכון</DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את המכון שלך לצמיתות ולא ניתן לבטל אותה.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">השלכות מחיקת המכון:</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>כל המידע של המכון יימחק לצמיתות</li>
                <li>כל המטפלים הקשורים למכון יימחקו</li>
                <li>כל השירותים והסדנאות יימחקו</li>
                <li>כל התורים העתידיים יבוטלו</li>
                <li>כל הביקורות יימחקו</li>
                <li>כל התמונות והקבצים יימחקו</li>
                <li>לא תוכל לשחזר את המידע לאחר המחיקה</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                הקלד "מחק מכון" לאישור המחיקה:
              </Label>
              <Input 
                id="delete-confirmation"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="מחק מכון"
                className="border-red-300 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowDeleteInstituteDialog(false);
                setDeleteConfirmationText('');
              }}
            >
              ביטול
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteInstitute}
              disabled={deleteConfirmationText !== 'מחק מכון'}
            >
              מחק מכון לצמיתות
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default StoreManagement;
