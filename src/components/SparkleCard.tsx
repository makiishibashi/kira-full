import { useState } from 'react';
import { format } from 'date-fns';
import { Heart, Star, Sun, MessageCircle, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useTranslation } from 'react-i18next';

type SparkleCardProps = {
  post: Sparkle;
};

const SparkleCard = ({ post }: SparkleCardProps) => {
  const { user } = useAuth();
  const { addReaction, removeReaction } = usePosts();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const isOwnPost = user?.id === post.userId;
  
  const getCategoryIcon = () => {
    switch (post.category) {
      case 'partner':
        return <Heart className="h-5 w-5 text-primary-500" />;
      case 'self':
        return <Star className="h-5 w-5 text-secondary-500" />;
      case 'daily':
        return <Sun className="h-5 w-5 text-accent-500" />;
      default:
        return <Heart className="h-5 w-5 text-primary-500" />;
    }
  };

  const getCategoryLabel = () => {
    switch (post.category) {
      case 'partner':
        return t('sparkle.categories.partner');
      case 'self':
        return t('sparkle.categories.self');
      case 'daily':
        return t('sparkle.categories.daily');
      default:
        return t('sparkle.categories.partner');
    }
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'partner':
        return "bg-primary-100 text-primary-700";
      case 'self':
        return "bg-secondary-100 text-secondary-700";
      case 'daily':
        return "bg-accent-100 text-accent-700";
      default:
        return "bg-primary-100 text-primary-700";
    }
  };

  const handleReactionClick = async (emoji: string) => {
    if (!user) return;
    
    const existingReaction = post.reactions.find(
      r => r.userId === user.id && r.emoji === emoji
    );
    
    if (existingReaction) {
      await removeReaction(post.id, existingReaction.id);
    } else {
      await addReaction(post.id, emoji);
    }
    
    setShowReactionPicker(false);
  };

  const reactions = ['❤️', '😍', '👏', '✨', '🙏', '🥰'];
  
  const reactionCounts = post.reactions.reduce((acc: Record<string, { count: number, reacted: boolean }>, reaction) => {
    const emoji = reaction.emoji;
    if (!acc[emoji]) {
      acc[emoji] = { count: 0, reacted: false };
    }
    acc[emoji].count += 1;
    if (user && reaction.userId === user.id) {
      acc[emoji].reacted = true;
    }
    return acc;
  }, {});

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-6"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor()}`}>
              {getCategoryIcon()}
              <span className="ml-1">{getCategoryLabel()}</span>
            </div>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {format(new Date(post.createdAt), 'yyyy年MM月dd日')}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {isOwnPost ? 'あなた' : post.userName}
          </div>
        </div>
        
        <p className="text-gray-800 mb-3">{post.text}</p>
        
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="きらめきの瞬間" 
            className="w-full h-auto rounded-lg mb-3 object-cover" 
            style={{ maxHeight: '300px' }}
          />
        )}
        
        <AnimatePresence>
          {(isExpanded || post.appreciation || post.gratitude) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-2 overflow-hidden"
            >
              {post.appreciation && (
                <div className="bg-primary-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-primary-700 mb-1">{t('sparkle.form.appreciation')}</h4>
                  <p className="text-sm text-gray-700">{post.appreciation}</p>
                </div>
              )}
              
              {post.gratitude && (
                <div className="bg-secondary-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-secondary-700 mb-1">{t('sparkle.form.gratitude')}</h4>
                  <p className="text-sm text-gray-700">{post.gratitude}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {(post.appreciation || post.gratitude) && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-3 block"
          >
            もっと見る...
          </button>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex items-center space-x-2">
        {Object.entries(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mr-2">
            {Object.entries(reactionCounts).map(([emoji, { count, reacted }]) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  reacted 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{emoji}</span>
                <span className="ml-1">{count}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="relative ml-auto">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="inline-flex items-center text-gray-500 hover:text-primary-600"
          >
            <Smile className="h-5 w-5" />
            <span className="ml-1 text-sm">リアクション</span>
          </button>
          
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-10"
              >
                <div className="flex space-x-2">
                  {reactions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      className="text-xl hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SparkleCard;