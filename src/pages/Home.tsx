import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import SparkleCard from '../components/SparkleCard';
import EmptyState from '../components/EmptyState';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { user } = useAuth();
  const { posts, isLoading } = usePosts();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const partnerConnected = user && user.partnerId;
  
  // Filter posts based on search query
  const filteredPosts = searchQuery 
    ? posts.filter(post => 
        post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.appreciation && post.appreciation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.gratitude && post.gratitude.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 mb-4 rounded-full bg-primary-200"></div>
          <div className="h-6 bg-primary-200 rounded w-3/4 max-w-md mb-2.5"></div>
          <div className="h-4 bg-primary-100 rounded w-1/2 max-w-sm mb-2.5"></div>
          <div className="h-4 bg-primary-100 rounded w-1/3 max-w-xs"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('sparkle.feed')}</h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          {t('sparkle.new')}
        </Link>
      </div>
      
      {!partnerConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6"
        >
          <h3 className="font-medium text-accent-800 mb-1">{t('partner.connect')}</h3>
          <p className="text-sm text-accent-700 mb-3">
            {t('partner.status.notConnected')}
          </p>
          <Link
            to="/connect"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-accent-700 bg-accent-100 hover:bg-accent-200"
          >
            {t('partner.connect')}
          </Link>
        </motion.div>
      )}
      
      {posts.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.searchSparkles')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title={t('common.noSparkles')}
          description={t('common.createFirst')}
          action={
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              {t('sparkle.new')}
            </Link>
          }
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title={t('common.noResults')}
          description={t('common.empty')}
          action={
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-700 bg-primary-50 hover:bg-primary-100"
            >
              {t('common.clearSearch')}
            </button>
          }
        />
      ) : (
        <div>
          {filteredPosts.map(post => (
            <SparkleCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;