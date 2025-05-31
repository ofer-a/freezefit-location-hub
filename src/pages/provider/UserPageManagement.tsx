
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import PhotoGalleryManager from '@/components/provider/PhotoGalleryManager';

interface Photo {
  id: string;
  url: string;
  category: 'treatment-room' | 'ice-baths' | 'waiting-area';
}

const UserPageManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handlePhotoAdd = (photo: Photo) => {
    setPhotos(prev => [...prev, photo]);
  };

  const handlePhotoDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">עיצוב דף למשתמש</h1>
              <p className="text-gray-600 mt-1">ניהול גלריית תמונות ופרטי המכון</p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/dashboard">
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                  חזרה ללוח הבקרה
                </button>
              </Link>
            </div>
          </div>
          
          <div className="space-y-8">
            <PhotoGalleryManager
              category="treatment-room"
              title="חדר טיפולים אישי"
              photos={photos}
              onPhotoAdd={handlePhotoAdd}
              onPhotoDelete={handlePhotoDelete}
            />
            
            <PhotoGalleryManager
              category="ice-baths"
              title="אמבטיות קרח מקצועיות"
              photos={photos}
              onPhotoAdd={handlePhotoAdd}
              onPhotoDelete={handlePhotoDelete}
            />
            
            <PhotoGalleryManager
              category="waiting-area"
              title="אזור המתנה"
              photos={photos}
              onPhotoAdd={handlePhotoAdd}
              onPhotoDelete={handlePhotoDelete}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserPageManagement;
