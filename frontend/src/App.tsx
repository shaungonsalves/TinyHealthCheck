import { Container, Paper } from '@mui/material';
import { StatusProvider } from './context/StatusContext';
import { useSSE } from './hooks/useSSE';
import { Header } from './components/Header';
import { TargetForm } from './components/TargetForm';
import { StatusTable } from './components/StatusTable';
import { ConnectionAlert } from './components/ConnectionAlert';

function AppContent() {
  useSSE(); // Initialize SSE connection
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ConnectionAlert />
        <Paper sx={{ p: 3, mb: 3 }}>
          <TargetForm />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <StatusTable />
        </Paper>
      </Container>
    </>
  );
}

function App() {
  return (
    <StatusProvider>
      <AppContent />
    </StatusProvider>
  );
}

export default App;