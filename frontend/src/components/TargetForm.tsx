import { FormEvent, useState } from 'react';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useStatus } from '../hooks/useStatus';

export const TargetForm = () => {
    const { addTarget } = useStatus();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateUrl = (value: string): boolean => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateUrl(url)) {
            setError('Please enter a valid URL (including http:// or https://)');
            return;
        }

        setLoading(true);
        try {
            await addTarget(url);
            setUrl('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                    fullWidth
                    label="URL to monitor"
                    variant="outlined"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError(null);
                    }}
                    error={!!error && error.includes('valid')}
                    disabled={loading}
                    placeholder="https://example.com"
                />
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !url}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    sx={{ height: 56, minWidth: 120 }}
                >
                    {loading ? 'Adding...' : 'Add'}
                </Button>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};