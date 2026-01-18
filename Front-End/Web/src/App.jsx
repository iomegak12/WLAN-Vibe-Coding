import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider, useUI } from './contexts/UIContext';
import SessionTimeoutDialog from './components/SessionTimeoutDialog';
import AppRoutes from './routes/AppRoutes';
import theme from './theme';

// Snackbar component that uses UIContext
const GlobalSnackbar = () => {
  const { snackbar, hideSnackbar } = useUI();

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

// Session timeout dialog component that uses AuthContext
const GlobalSessionTimeoutDialog = () => {
  const { showTimeoutDialog, timeoutSecondsLeft, extendSession, logout } = useAuth();

  return (
    <SessionTimeoutDialog
      open={showTimeoutDialog}
      timeLeft={timeoutSecondsLeft}
      onExtend={extendSession}
      onLogout={logout}
    />
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UIProvider>
          <AppRoutes />
          <GlobalSnackbar />
          <GlobalSessionTimeoutDialog />
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
