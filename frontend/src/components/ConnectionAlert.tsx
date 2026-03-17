import { Alert, Box } from '@mui/material';
import { useSSE } from '../hooks/useSSE';
import { useConfig } from '../context/ConfigContext';

export const ConnectionAlert = () => {
  const { config } = useConfig();
  const { isConnected, retryCount } = useSSE();

  if (!config) return null;

  const isDisconnected = !isConnected;
  const maxRetries = config.maxReconnectAttempts;

  const getMessage = () => {
    if (!isDisconnected) return '';
    if (retryCount >= maxRetries) {
      return 'Unable to reconnect. Please refresh the page.';
    }
    if (retryCount > 0) {
      return `Connection lost. Reconnecting... (attempt ${retryCount}/${maxRetries})`;
    }
    return 'Connection lost. Reconnecting...';
  };

  const message = getMessage();
  const severity = retryCount >= maxRetries ? 'error' : 'warning';

  if (!isDisconnected) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={severity} sx={severity === 'error' ? { backgroundColor: '#d32f2f', color: 'white' } : {}}>
        {message}
      </Alert>
    </Box>
  );
};