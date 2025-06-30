import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Album, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { path: '/', icon: <Sparkles size={24} /> },
    { path: '/album', icon: <Album size={24} /> },
    { path: '/connect', icon: <UserPlus size={24} /> },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Sparkles className="h-6 w-6 text-primary-500" />
          </Link>

          <nav className="flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative p-2 rounded-md transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  {link.icon}
                </div>
                {location.pathname === link.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                    layoutId="navbar-indicator"
                    initial={false}
                  />
                )}
              </Link>
            ))}
            
            <div className="flex items-center">
              <div className="p-2 relative group">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg py-1 px-2 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {user?.name}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`p-2 rounded-md transition-colors ${
                  isLoggingOut 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                aria-label="Logout"
              >
                {isLoggingOut ? (
                  <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-primary-600 rounded-full" />
                ) : (
                  <LogOut size={24} />
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;