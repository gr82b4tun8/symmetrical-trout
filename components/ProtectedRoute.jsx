import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    // You can replace this with a nicer loading spinner that matches your design
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111]">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-[#3366FF] animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}