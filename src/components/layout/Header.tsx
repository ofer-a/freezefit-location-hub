
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-freezefit font-bold text-2xl">
          Freezefit
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          <Link to="/" className="text-gray-700 hover:text-freezefit-300">
            דף הבית
          </Link>
          <Link to="/#about" className="text-gray-700 hover:text-freezefit-300">
            אודות
          </Link>
          <Link to="/#newsletter" className="text-gray-700 hover:text-freezefit-300">
            הרשמה לעדכונים
          </Link>
          <Link to="/#contact" className="text-gray-700 hover:text-freezefit-300">
            צור קשר
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === 'customer' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      הפרופיל שלי
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/find-institute')}>
                      מצא מכון
                    </DropdownMenuItem>
                  </>
                )}
                {role === 'provider' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      לוח בקרה
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/order-management')}>
                      ניהול הזמנות
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/store-management')}>
                      ניהול חנות
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  התנתקות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-freezefit-300 hover:text-freezefit-400">
                  התחברות
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-freezefit-300 hover:bg-freezefit-400 text-white">
                  הרשמה
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={toggleMobileMenu} className="md:hidden text-gray-700">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
              דף הבית
            </Link>
            <Link to="/#about" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
              אודות
            </Link>
            <Link to="/#newsletter" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
              הרשמה לעדכונים
            </Link>
            <Link to="/#contact" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
              צור קשר
            </Link>
            <div className="border-t border-gray-200 pt-3 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="text-gray-700 font-medium">{user?.name}</div>
                  {role === 'customer' && (
                    <>
                      <Link to="/profile" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
                        הפרופיל שלי
                      </Link>
                      <Link to="/find-institute" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
                        מצא מכון
                      </Link>
                    </>
                  )}
                  {role === 'provider' && (
                    <>
                      <Link to="/dashboard" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
                        לוח בקרה
                      </Link>
                      <Link to="/order-management" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
                        ניהול הזמנות
                      </Link>
                      <Link to="/store-management" className="text-gray-700 hover:text-freezefit-300 py-2" onClick={toggleMobileMenu}>
                        ניהול חנות
                      </Link>
                    </>
                  )}
                  <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="text-red-500 hover:text-red-700 py-2 text-right">
                    התנתקות
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-freezefit-300 hover:text-freezefit-400 py-2" onClick={toggleMobileMenu}>
                    התחברות
                  </Link>
                  <Link to="/register" className="bg-freezefit-300 hover:bg-freezefit-400 text-white py-2 px-4 rounded text-center" onClick={toggleMobileMenu}>
                    הרשמה
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
