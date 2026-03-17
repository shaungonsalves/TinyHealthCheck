import { AppBar, Toolbar, Typography, Button, Select, MenuItem, Box, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';
import { useStatus } from '../hooks/useStatus';
import { useConfig } from '../context/ConfigContext';
import { setCheckInterval } from '../services/api';
import { useSSE } from '../hooks/useSSE';

export const Header = () => {
    const { config } = useConfig();
    const { refresh } = useStatus();
    const { reconnect } = useSSE();
    const [interval, setInterval] = useState(config?.defaultInterval || 30000);
    const [loading, setLoading] = useState(false);

    const handleIntervalChange = async (value: number) => {
        setLoading(true);
        try {
            await setCheckInterval(value, config?.apiBase);
            setInterval(value);
        } catch (err) {
            // ...
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        refresh();
        reconnect();
    };

    if (!config) return null; // or loading placeholder

    const intervals = config.availableIntervals.map(value => ({
        value,
        label: `${value / 1000}s`,
    }));

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