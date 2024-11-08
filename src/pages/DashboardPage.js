import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Donation History Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Donation History
            </Typography>
            <Typography color="text.secondary">
              No donations yet
            </Typography>
          </Paper>
        </Grid>

        {/* Suggested Events Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Suggested Events
            </Typography>
            <Typography color="text.secondary">
              No suggested events available
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardPage;