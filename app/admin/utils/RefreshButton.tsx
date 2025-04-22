"use client";

import { useNotify, useRefresh, Button } from 'react-admin';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback, useState } from 'react';

interface RefreshButtonProps {
  resource?: string;
  label?: string;
}

/**
 * A button component that refreshes the current list view
 * with debounce functionality to prevent rapid consecutive calls
 */
export const RefreshButton = ({ 
  resource,
  label = 'Refresh'
}: RefreshButtonProps) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    refresh();
    notify(resource 
      ? `${resource.charAt(0).toUpperCase() + resource.slice(1)} list refreshed` 
      : 'List refreshed', { type: 'info' });
      
    // Debounce for 2 seconds
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [refresh, notify, resource, isRefreshing]);
  
  return (
    <Button
      onClick={handleRefresh}
      label={label}
      startIcon={<RefreshIcon />}
      disabled={isRefreshing}
    />
  );
};

export default RefreshButton;
