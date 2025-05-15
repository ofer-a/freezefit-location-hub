
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-freezefit-300 mb-4">404</h1>
          <p className="text-2xl font-medium mb-6">הדף לא נמצא</p>
          <p className="text-gray-600 mb-8">
            מצטערים, הדף שחיפשת אינו קיים. ייתכן שהכתובת שהוזנה שגויה או שהדף הוסר.
          </p>
          <Link to="/">
            <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
