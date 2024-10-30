import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import Navbar from '../components/Navbar';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const session = await account.get();
      setIsAuthenticated(!!session);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}