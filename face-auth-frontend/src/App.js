import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, AppBar, Toolbar, IconButton } from '@mui/material';
import Register from './components/Register';
import Verify from './components/Verify';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import VerifiedIcon from '@mui/icons-material/Verified';
import FaceIcon from '@mui/icons-material/Face';

const App = () => {
  const [view, setView] = useState('register'); // To track the current view

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', boxShadow: 'none' }}>
        <Toolbar>
          <FaceIcon sx={{ marginRight: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Face Authentication
          </Typography>
          <Button
            color="inherit"
            startIcon={<HowToRegIcon />}
            onClick={() => setView('register')}
            sx={{ marginRight: 2 }}
          >
            Register
          </Button>
          <Button
            color="inherit"
            startIcon={<VerifiedIcon />}
            onClick={() => setView('verify')}
          >
            Verify
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: 3,
        }}
      >
        {/* Conditional rendering for Register and Verify components */}
        {view === 'register' ? <Register /> : <Verify />}
      </Box>
    </Box>
  );
};

export default App;
