import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import SparkleCard from '../components/SparkleCard';
import EmptyState from '../components/EmptyState';
import { SparkleCategory } from '../types';
import { useTranslation } from 'react-i18next';

const Album = () => {
  const { posts, isLoading } = usePosts();
  const [filter, setFilter] = useState<SparkleCategory | 'all'>('all');
  const { t } = useTranslation();
  
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category === filter);
  
  const groupedPosts = filteredPosts.reduce((groups: Record<string, typeof posts>, post) => {
    const date = format(new Date(post.createdAt), 'yyyy-MM');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(post);
    return groups;
  }, {});
  
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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

  const categories = [
    { value: 'all', label: t('sparkle.categories.all') },
    { value: 'partner', label: t('sparkle.categories.partner') },
    { value: 'self', label: t('sparkle.categories.self') },
    { value: 'daily', label: t('sparkle.categories.daily') },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('sparkle.album')}</h1>
        
        <div className="relative">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => {}}
          >
            <Filter className="h-4 w-4 mr-2" />
            {categories.find(c => c.value === filter)?.label}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">{t('sparkle.filter')}</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value as SparkleCategory | 'all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filter === category.value
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500 ring-opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title={t('sparkle.album.empty')}
          description={t('sparkle.album.emptyDescription')}
          action={null}
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-8 w-8" />}
          title={t('sparkle.album.noMatching')}
          description={t('sparkle.album.tryDifferent')}
          action={
            <button
              onClick={() => setFilter('all')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-700 bg-primary-50 hover:bg-primary-100"
            >
              {t('sparkle.album.showAll')}
            </button>
          }
        />
      ) : (
        <div>
          {sortedDates.map(date => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {format(new Date(date), 'yyyy年MM月')}
              </h3>
              
              <div>
                {groupedPosts[date].map(post => (
                  <SparkleCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Album;