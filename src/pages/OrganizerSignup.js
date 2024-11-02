import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material';

function OrganizerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    employeeId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Need to add handling
    console.log('Form submitted:', formData);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Organizer Signup
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Please note: We will request an employment verification letter from your
            employer as proof of employment.
          </Alert>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              required
              label="Company Name"
              name="company"
              value={formData.company}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              required
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Sign Up
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default OrganizerSignup;