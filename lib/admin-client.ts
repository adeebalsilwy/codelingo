'use client';

import { useEffect, useState } from "react";

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check');
        
        // Check if response is ok first
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading, error };
}; 