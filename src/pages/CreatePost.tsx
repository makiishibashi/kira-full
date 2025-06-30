// src/pages/CreatePost.tsx の完全なコード

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Star, Sun, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import { SparkleCategory, SparkleFormData } from '../types';
import { useTranslation } from 'react-i18next';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Omit<SparkleFormData, 'imageUrl'>>({
    text: '',
    category: 'partner',
    appreciation: '',
    gratitude: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategorySelect = (category: SparkleCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t('sparkle.form.fileTooLarge', 'ファイルサイズが5MBを超えています。'));
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError(t('common.loginRequired', 'ログインが必要です。'));
      return;
    }

    if (!formData.text.trim()) {
      setError(t('sparkle.form.required', 'キラメキの内容は必須です。'));
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        console.log('Uploading image to Storage...');
        const storage = getStorage();
        const storageRef = ref(storage, `posts/${user.id}/${Date.now()}_${imageFile.name}`);
        
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log('Image uploaded successfully. URL:', imageUrl);
      }

      const finalPostData: SparkleFormData = {
        ...formData,
        imageUrl: imageUrl,
      };

      const result = await createPost(finalPostData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || t('common.error', 'エラーが発生しました。'));
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      if (err.code === 'storage/unauthorized') {
        setError(t('sparkle.form.uploadPermissionError', '写真のアップロード権限がありません。Storageのルールを確認してください。'));
      } else {
        setError(t('common.error', 'エラーが発生しました。'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'partner', label: t('sparkle.categories.partner'), icon: <Heart className="h-5 w-5" />, description: t('sparkle.categories.partnerDesc') },
    { id: 'self', label: t('sparkle.categories.self'), icon: <Star className="h-5 w-5" />, description: t('sparkle.categories.selfDesc') },
    { id: 'daily', label: t('sparkle.categories.daily'), icon: <Sun className="h-5 w-5" />, description: t('sparkle.categories.dailyDesc') },
  ];
  
  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('sparkle.new')}</h1>
      </div>
      
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sparkle.form.type')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => handleCategorySelect(category.id as SparkleCategory)} className={`flex flex-col items-center p-4 rounded-lg border ${formData.category === category.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500' : 'border-gray-300 hover:border-gray-400'}`}>
                <div className={`p-2 rounded-full ${formData.category === category.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>{category.icon}</div>
                <span className="mt-2 font-medium text-sm">{category.label}</span>
                <span className="mt-1 text-xs text-gray-500">{category.description}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">{t('sparkle.form.text')}*</label>
          <textarea id="text" name="text" rows={4} value={formData.text} onChange={handleChange} placeholder={t('sparkle.form.placeholder')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required/>
          <p className="mt-1 text-xs text-gray-500">{formData.text.length}/200 {t('common.characters')}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sparkle.form.photo')}</label>
          <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            {imagePreview ? (
              <div className="space-y-2 text-center">
                <img src={imagePreview} alt={t('sparkle.form.preview')} className="mx-auto h-32 w-auto object-contain rounded"/>
                <button type="button" onClick={removeImage} className="text-sm text-red-600 hover:text-red-700">{t('common.remove')}</button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>{t('sparkle.upload')}</span>
                    <input id="image-upload" name="image-upload" type="file" accept="image/png, image/jpeg, image/gif" className="sr-only" onChange={handleImageUpload}/>
                  </label>
                  <p className="pl-1">{t('sparkle.dragAndDrop')}</p>
                </div>
                <p className="text-xs text-gray-500">{t('sparkle.photoLimit')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="appreciation" className="block text-sm font-medium text-gray-700 mb-1">{t('sparkle.form.appreciation')}</label>
          <textarea id="appreciation" name="appreciation" rows={2} value={formData.appreciation} onChange={handleChange} placeholder={t('sparkle.form.appreciationPlaceholder')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        
        <div>
          <label htmlFor="gratitude" className="block text-sm font-medium text-gray-700 mb-1">{t('sparkle.form.gratitude')}</label>
          <textarea id="gratitude" name="gratitude" rows={2} value={formData.gratitude} onChange={handleChange} placeholder={t('sparkle.form.gratitudePlaceholder')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="button" onClick={() => navigate(-1)} className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={isSubmitting} className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'}`}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('sparkle.sharing')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                {t('sparkle.share')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;