// src/pages/CreatePost.tsx の修正後のコード

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Star, Sun, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import { SparkleCategory, SparkleFormData } from '../types';
import { useTranslation } from 'react-i18next';
// ▼▼▼ 変更点1: 不要になるFirebase Storageのインポートをコメントアウト ▼▼▼
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // formDataの型は、最初からimageUrlを除外しているので、このままでOKです
  const [formData, setFormData] = useState<Omit<SparkleFormData, 'imageUrl'>>({
    text: '',
    category: 'partner',
    appreciation: '',
    gratitude: '',
  });

  // ▼▼▼ 変更点2: 画像関連のStateをコメントアウト ▼▼▼
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategorySelect = (category: SparkleCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };
  
  // ▼▼▼ 変更点3: 画像関連の関数をコメントアウト ▼▼▼
  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   if (file.size > 5 * 1024 * 1024) {
  //     setError(t('sparkle.form.fileTooLarge', 'ファイルサイズが5MBを超えています。'));
  //     return;
  //   }
    
  //   setImageFile(file);
  //   setImagePreview(URL.createObjectURL(file));
  // };

  // const removeImage = () => {
  //   setImageFile(null);
  //   setImagePreview(null);
  // };
  
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
      // ▼▼▼ 変更点4: handleSubmit内の画像アップロード処理をコメントアウト ▼▼▼
      // let imageUrl: string | undefined = undefined;

      // if (imageFile) {
      //   console.log('Uploading image to Storage...');
      //   const storage = getStorage();
      //   const storageRef = ref(storage, `posts/${user.id}/${Date.now()}_${imageFile.name}`);
        
      //   const uploadResult = await uploadBytes(storageRef, imageFile);
      //   imageUrl = await getDownloadURL(uploadResult.ref);
      //   console.log('Image uploaded successfully. URL:', imageUrl);
      // }

      // ▼▼▼ 変更点5: 送信するデータからimageUrlを削除 ▼▼▼
      // imageUrlは不要になったので、元のformDataをそのまま渡します。
      // Omit<...>型と一致するので、これでOKです。
      const finalPostData = {
        ...formData,
      };

      const result = await createPost(finalPostData as SparkleFormData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || t('common.error', 'エラーが発生しました。'));
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      // ▼▼▼ 変更点6: Storage関連のエラーハンドリングを汎用的なものに ▼▼▼
      // if (err.code === 'storage/unauthorized') {
      //   setError(t('sparkle.form.uploadPermissionError', '写真のアップロード権限がありません。Storageのルールを確認してください。'));
      // } else {
         setError(t('common.error', 'エラーが発生しました。'));
      // }
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
      {/* (中略...) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* (中略...) */}
        
        {/* ▼▼▼ 変更点7: 写真アップロードのUI全体をコメントアウト ▼▼▼ */}
        {/*
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
        */}
        
        {/* (中略...) */}
      </form>
    </div>
  );
};

export default CreatePost;