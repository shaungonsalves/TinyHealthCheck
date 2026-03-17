import { Alert, Collapse, Button, Box } from '@mui/material';
import { useStatus } from '../context/StatusContext';
import { useSSE } from '../hooks/useSSE';

export const ConnectionAlert = () => {
  const { error, setError } = useStatus();
  const { retryCount, reconnect } = useSSE();
  const maxRetries = 5; // should match MAX_RECONNECT_ATTEMPTS

  const handleDismiss = () => {
    setError(null);
  };

  // Determine severity and color intensity
  const isExhausted = retryCount >= maxRetries;
  const severity = isExhausted ? 'error' : 'warning';
  const sx = isExhausted ? { backgroundColor: '#d32f2f', color: 'white' } : {};

  return (
    <Collapse in={!!error && !isExhausted}>
      <Box sx={{ mb: 2 }}>
        <Alert
          severity={severity}
          onClose={handleDismiss}
          action={
            <Button color="inherit" size="small" onClick={reconnect}>
              Retry now
            </Button>
          }
          sx={sx}
        >
          {error}
        </Alert>
      </Box>
    </Collapse>
  );
};