import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useStatus } from '../hooks/useStatus';

export const StatusTable = () => {
  const { statuses } = useStatus();
  const urls = Object.keys(statuses).sort();

  if (urls.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No URLs tracked yet. Add one above.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>URL</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Latency (ms)</TableCell>
            <TableCell align="center">Last Checked</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {urls.map((url) => {
            const s = statuses[url];
            return (
              <TableRow key={url} hover>
                <TableCell component="th" scope="row" sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                  {url}
                </TableCell>
                <TableCell align="center">
                  {s.up === null ? (
                    <Chip
                      icon={<HourglassEmptyIcon />}
                      label="Waiting"
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  ) : s.up ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Up"
                      size="small"
                      color="success"
                    />
                  ) : (
                    <Chip
                      icon={<ErrorIcon />}
                      label="Down"
                      size="small"
                      color="error"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {s.latency !== null ? s.latency : '-'}
                </TableCell>
                <TableCell align="center">
                  {s.lastChecked
                    ? new Date(s.lastChecked).toLocaleString()
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};