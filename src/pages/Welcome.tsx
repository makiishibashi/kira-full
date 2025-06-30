import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Welcome = () => {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-accent-100">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-full p-5 shadow-md"
            >
              <Sparkles className="h-16 w-16 text-primary-500" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-3xl font-bold text-primary-900 mb-3"
          >
            {t('welcome.title')}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-lg text-gray-600 mb-8"
          >
            {t('welcome.description')}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full flex justify-center items-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-colors border border-gray-200 ${
                isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {isLoggingIn ? t('auth.signingIn') : t('auth.continueWithGoogle')}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-b from-primary-100 to-accent-100 text-gray-500">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
            >
              {t('welcome.createAccount')}
            </Link>
            
            <Link
              to="/login"
              className="block w-full bg-white hover:bg-gray-50 text-primary-700 font-medium py-3 px-4 rounded-lg shadow-sm border border-gray-200 transition-colors"
            >
              {t('welcome.login')}
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 text-sm text-gray-500"
          >
            <p>{t('welcome.footer.line1')}</p>
            <p>{t('welcome.footer.line2')}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;