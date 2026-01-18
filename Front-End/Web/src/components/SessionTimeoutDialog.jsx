import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const SessionTimeoutDialog = ({ open, timeLeft, onExtend, onLogout }) => {
  const [seconds, setSeconds] = useState(timeLeft);

  useEffect(() => {
    if (open) {
      setSeconds(timeLeft);
      const interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, timeLeft]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timeLeft - seconds) / timeLeft) * 100;

  return (
    <Dialog
      open={open}
      onClose={onExtend}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="span" fontWeight={600}>
            Session Timeout Warning
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Your session is about to expire due to inactivity.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You will be automatically logged out in:
        </Typography>

        <Box
          sx={{
            backgroundColor: 'warning.lighter',
            borderRadius: 2,
            padding: 3,
            textAlign: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h3" color="warning.main" fontWeight={700}>
            {formatTime(seconds)}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          color="warning"
          sx={{
            height: 8,
            borderRadius: 4,
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Click "Stay Logged In" to extend your session, or "Logout" to sign out now.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: 3, paddingTop: 0 }}>
        <Button
          onClick={onLogout}
          color="inherit"
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Logout
        </Button>
        <Button
          onClick={onExtend}
          color="primary"
          variant="contained"
          autoFocus
          sx={{ textTransform: 'none' }}
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;
