import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import '../styles/style.css';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import theme from '../theme.js';

export default function SignInForm() {
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      showAlert('Login successful', 'success');
      navigate('/');
    } catch (error) {
      showAlert(error.message || 'Failed to login', 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pt: { xs: 11, sm: 11 },
    pb: { xs: 8, sm: 12 },
    maxWidth: 0,
    width: '100%',
    bgcolor: '#EDAB6F',
    minHeight: '100vh',
  };

  const textFieldStyles = {
    mt: 1,
    border: '2px solid',
    borderColor: 'black',
    background: '#FFFFFF',
    width: 500,
  };

  return (
    <ThemeProvider theme={theme}>
      <Container className="width-no-space" disableGutters sx={containerStyles}>
        <span className="circle"></span>
        <Typography
          sx={{ fontFamily: 'Poppins', padding: 2, color: '#021944', fontWeight: 'bold' }}
          variant="h4"
          component="div"
        >
          Enter account details
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            sx={textFieldStyles}
            id="email"
            label="Email Address"
            name="email"
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
          />
          <TextField
            sx={textFieldStyles}
            id="password"
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
          />
          <Button
            sx={{ mt: 1, width: 500, height: 50 }}
            variant="outlined"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Container>
    </ThemeProvider>
  );
}
