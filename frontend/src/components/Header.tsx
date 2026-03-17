import { AppBar, Toolbar, Typography, Button, Select, MenuItem, Box, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import { useStatus } from '../hooks/useStatus';
import { setCheckInterval } from '../services/api';
import { useSSE } from '../hooks/useSSE';

const intervals = [
  { value: 10000, label: '10s' },
  { value: 30000, label: '30s' },
  { value: 60000, label: '60s' },
];

export const Header = () => {
  const { refresh } = useStatus();
  const { reconnect } = useSSE();
  const [interval, setInterval] = useState(30000);
  const [loading, setLoading] = useState(false);

  const handleIntervalChange = async (value: number) => {
    setLoading(true);
    try {
      await setCheckInterval(value);
      setInterval(value);
    } catch (err) {
      console.error('Failed to set interval', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    refresh();
    reconnect(); // also attempt to reconnect SSE if needed
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tiny Health Check
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Select
            value={interval}
            onChange={(e) => handleIntervalChange(e.target.value as number)}
            disabled={loading}
            size="small"
            sx={{ color: 'white', borderColor: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
          >
            {intervals.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title="Refresh data & reconnect">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};