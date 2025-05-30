'use client';

import { useEffect, useState } from "react";

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async (retryCount = 0, delay = 1000) => {
      try {
        const response = await fetch('/api/admin/check', {
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store',
          // Add credentials to ensure cookies are sent
          credentials: 'include'
        });
        
        // If we get a 401, it might be a temporary auth issue - retry if we haven't hit max retries
        if (response.status === 401 && retryCount < 3) {
          console.log(`Auth error, retrying (${retryCount + 1}/3) in ${delay}ms...`);
          setTimeout(() => checkAdmin(retryCount + 1, delay * 2), delay);
          return;
        }
        
        // For other non-OK responses, just treat as not an admin
        if (!response.ok) {
          if (response.status === 401) {
            setError("Authorization error - please reload the page or try logging in again");
          } else {
            setError(`Error checking admin status: ${response.status}`);
          }
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // Ensure data.isAdmin is a boolean
        setIsAdmin(data && typeof data.isAdmin === 'boolean' ? data.isAdmin : false);
        setError(null);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setError(error instanceof Error ? error.message : 'Failed to check admin status');
      } finally {
        if (loading) {
          setLoading(false);
        }
      }
    };

    checkAdmin();
  }, [loading]);

  return { isAdmin, loading, error };
}; 