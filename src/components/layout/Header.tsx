
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const headerClass = isHome
    ? `fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur shadow-md' : 'bg-transparent'
      }`
    : 'bg-white shadow-md';
  
  const textClass = isHome && !isScrolled ? 'text-white' : 'text-gray-800';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className={`text-xl font-bold ${textClass}`}>
              Freezefit
            </span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-6">
              <NavigationMenuItem>
                <Link to="/" className={`text-sm font-medium ${textClass} hover:text-freezefit-300`}>
                  דף הבית
                </Link>
              </NavigationMenuItem>
              
              {isHome && (
                <>
                  <NavigationMenuItem>
                    <a 
                      href="#about" 
                      onClick={(e) => scrollToSection('about', e)} 
                      className={`text-sm font-medium ${textClass} hover:text-freezefit-300`}
                    >
                      אודות
                    </a>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <a 
                      href="#contact" 
                      onClick={(e) => scrollToSection('contact', e)} 
                      className={`text-sm font-medium ${textClass} hover:text-freezefit-300`}
                    >
                      צור קשר
                    </a>
                  </NavigationMenuItem>
                </>
              )}
              
              {isAuthenticated ? (
                <>
                  <NavigationMenuItem>
                    <Link 
                      to={user?.role === 'provider' ? '/dashboard' : '/profile'} 
                      className={`text-sm font-medium ${textClass} hover:text-freezefit-300`}
                    >
                      {user?.role === 'provider' ? 'לוח בקרה' : 'הפרופיל שלי'}
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Button
                      variant="outline"
                      className="border-1 border-freezefit-300 text-black hover:bg-freezefit-50"
                      onClick={() => logout()}
                    >
                      התנתק
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className={`border-1 text-black ${isHome && !isScrolled ? 'border-white hover:bg-white/10' : 'border-freezefit-300 hover:bg-freezefit-50'}`}
                      >
                        התחבר
                      </Button>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link to="/register">
                      <Button
                        className={isHome && !isScrolled ? 'bg-white text-black hover:bg-white/90' : 'bg-freezefit-300 text-black hover:bg-freezefit-400'}
                      >
                        הרשמה
                      </Button>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
