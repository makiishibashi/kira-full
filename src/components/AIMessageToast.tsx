import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';

type AIMessageToastProps = {
  message: string;
};

const AIMessageToast = ({ message }: AIMessageToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { clearAIMessage } = usePosts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(clearAIMessage, 300); // Clear after exit animation
    }, 8000);

    return () => clearTimeout(timer);
  }, [clearAIMessage]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(clearAIMessage, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div className="mx-4 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="bg-primary-100 rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-700">{message}</p>
                <p className="mt-1 text-xs text-gray-500">- Kira, your sparkle fairy</p>
              </div>
              <button 
                onClick={handleClose}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIMessageToast;