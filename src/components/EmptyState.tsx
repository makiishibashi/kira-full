import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 text-secondary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </motion.div>
  );
};

export default EmptyState;