
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-freezefit text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Freezefit</h3>
            <p className="text-gray-300">
              פלטפורמה מתקדמת לניהול וחיפוש מרכזי טיפול באמבטיות קרח
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">דף הבית</Link>
              </li>
              <li>
                <Link to="/find-institute" className="text-gray-300 hover:text-white">מצא מכון</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">הרשמה</Link>
              </li>
              <li>
                <Link to="/#about" className="text-gray-300 hover:text-white">אודות</Link>
              </li>
              <li>
                <Link to="/#contact" className="text-gray-300 hover:text-white">צור קשר</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">צור קשר</h3>
            <address className="not-italic text-gray-300">
              <p>רחוב האלמוגים 45</p>
              <p>תל אביב, ישראל</p>
              <p className="mt-2">טלפון: 03-1234567</p>
              <p>דוא"ל: info@freezefit.co.il</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Freezefit. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
