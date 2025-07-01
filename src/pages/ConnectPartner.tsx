import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, UserPlus, Check, RefreshCw, UserMinus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const ConnectPartner = () => {
  const { user, generateInviteCode, connectPartner, disconnectPartner, refreshUserData } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const hasPartner = user?.partnerId;

  // Force refresh user data when component mounts
  useEffect(() => {
    console.log('ConnectPartner component mounted, refreshing user data');
    refreshUserData();
  }, [refreshUserData]);

  // Clear success/error messages after some time
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Log user state changes for debugging
  useEffect(() => {
    console.log('ConnectPartner - User state changed:', {
      userId: user?.id,
      hasPartner: !!user?.partnerId,
      partnerName: user?.partnerName,
      inviteCode: user?.inviteCode
    });
  }, [user]);
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = inviteCode.trim();
    
    if (!trimmedCode) {
      setError('招待コードを入力してください');
      return;
    }

    if (trimmedCode === user?.inviteCode) {
      setError('自分の招待コードは使用できません');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Attempting to connect with partner using code:', trimmedCode);
      await connectPartner(trimmedCode);
      setSuccess('パートナーと接続しました！');
      setInviteCode('');
      
      // Force immediate refresh after connection
      setTimeout(() => {
        console.log('Forcing refresh after successful connection');
        refreshUserData();
      }, 500);
      
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || '接続中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.partnerId) return;
    
    setIsDisconnecting(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Attempting to disconnect from partner');
      await disconnectPartner();
      setSuccess('パートナーとの接続を解除しました');
      setShowDisconnectConfirm(false);
      setInviteCode('');
      
      // Force immediate refresh after disconnection
      setTimeout(() => {
        console.log('Forcing refresh after successful disconnection');
        refreshUserData();
      }, 500);
      
    } catch (err: any) {
      console.error('Disconnect error:', err);
      setError(err.message || '接続解除中にエラーが発生しました');
      setShowDisconnectConfirm(false);
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  const handleGenerateCode = async () => {
    if (user) {
      try {
        const code = await generateInviteCode();
        setIsCopied(false);
        console.log('Generated new invite code:', code);
      } catch (error) {
        setError('新しいコードの生成に失敗しました');
      }
    }
  };
  
  const handleCopyCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-3 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {hasPartner ? 'パートナー接続状況' : 'パートナーと繋がる'}
        </h1>
      </div>
      
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-md mb-6 ${
            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          <p className="text-sm">{error || success}</p>
        </motion.div>
      )}
      
      {hasPartner ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-100 rounded-full p-4">
              <Check className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-center text-gray-900 mb-2">
            パートナーと繋がっています！
          </h2>
          
          <p className="text-center text-gray-600 mb-6">
            {user?.partnerName}さんと繋がっています。
            一緒にきらめきを見つけましょう！
          </p>
          
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              フィードに戻る
            </Link>
            
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="w-full flex items-center justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              接続を解除
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              招待コードを共有
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              このコードをパートナーに共有して繋がりましょう
            </p>
            
            <div className="flex mb-4">
              <div className="flex-1 bg-gray-100 rounded-l-lg p-3 font-mono text-center text-lg border-r">
                {user?.inviteCode || '-'}
              </div>
              <button
                onClick={handleCopyCode}
                disabled={!user?.inviteCode}
                className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 rounded-r-lg flex items-center justify-center"
              >
                {isCopied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <button
              onClick={handleGenerateCode}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              新しいコードを生成
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              パートナーと接続
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              パートナーから共有された招待コードを入力してください
            </p>
            
            <form onSubmit={handleConnect}>
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  招待コード
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="招待コードを入力"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    接続中...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    接続する
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDisconnectConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                接続を解除しますか？
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                {user?.partnerName}さんとの接続が解除されます。
                この操作は元に戻せません。
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 ${
                    isDisconnecting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  {isDisconnecting ? '解除中...' : '解除する'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectPartner;