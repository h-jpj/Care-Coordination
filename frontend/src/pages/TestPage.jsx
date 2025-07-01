import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const TestPage = () => {
  const testBackend = async () => {
    try {
      const response = await fetch('http://192.168.0.103:3003/health');
      const data = await response.json();
      console.log('Backend response:', data);
      alert('Backend is working! Check console for details.');
    } catch (error) {
      console.error('Backend error:', error);
      alert('Backend connection failed! Check console for details.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          🎉 React App is Working!
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          If you can see this page, the frontend is loading correctly.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={testBackend}
          sx={{ mt: 3 }}
        >
          Test Backend Connection
        </Button>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1">
            Current URL: {window.location.href}
          </Typography>
          <Typography variant="body1">
            Expected Backend: http://192.168.0.103:3003
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default TestPage;
