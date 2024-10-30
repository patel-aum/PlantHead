import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { account } from '../lib/appwrite';

export default function AuthLayout() {
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

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
}