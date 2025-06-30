import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIMessageToast from './AIMessageToast';
import { usePosts } from '../hooks/usePosts';

const Layout = () => {
  const { latestAIMessage } = usePosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-accent-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
      {latestAIMessage && <AIMessageToast message={latestAIMessage} />}
    </div>
  );
};

export default Layout;