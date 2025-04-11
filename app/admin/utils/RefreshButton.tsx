"use client";

import { useNotify, useRefresh, Button } from 'react-admin';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshButtonProps {
  resource?: string;
  label?: string;
}

/**
 * A button component that refreshes the current list view
 * Can be included in custom action bars for all admin list components
 */
export const RefreshButton = ({ 
  resource,
  label = 'Refresh'
}: RefreshButtonProps) => {
  const refresh = useRefresh();
  const notify = useNotify();
  
  const handleRefresh = () => {
    refresh();
    notify(resource 
      ? `${resource.charAt(0).toUpperCase() + resource.slice(1)} list refreshed` 
      : 'List refreshed', { type: 'info' });
  };
  
  return (
    <Button
      onClick={handleRefresh}
      label={label}
      startIcon={<RefreshIcon />}
    />
  );
};

export default RefreshButton; 