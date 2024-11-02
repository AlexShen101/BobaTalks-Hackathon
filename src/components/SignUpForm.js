import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import theme from '../theme.js';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }
    setLoading(true);

    try {
      const response = await signup({ email, password });
      console.log(response);

      if (response.status === 200) {
        showAlert('Account created successfully', 'success');
        navigate('/');
      } else if (
        response.response?.status === 400 ||
        response.response?.status === 401
      ) {
        showAlert('Invalid credentials', 'error');
      }
    } catch (err) {
      showAlert(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        className="width-no-space"
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pt: { xs: 11, sm: 11 },
          pb: { xs: 8, sm: 12 },
          // px: {xs: 80, sm:80},
          maxWidth: 0,
          width: '100%',
          bgcolor: '#EDAB6F',
          minHeight: '100vh',
        }}
      >
        <span className="circle"></span>
        <Typography sx={{ fontFamily: "Poppins", padding: 2, color: '#021944', fontWeight: 'bold' }} variant="h4" component="div">
          Enter account details
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            sx={{
              mt: 1,
              border: "2px solid",
              borderColor: "black",
              background: "#FFFFFF",
              width: 500,
            }}
            id="outlined-basic"
            label="Full Name"
            variant="outlined"
            disabled={loading}
          />
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mt: 1,
              border: "2px solid",
              borderColor: "black",
              background: "#FFFFFF",
              width: 500,
            }}
            id="outlined-basic"
            label="Email Address"
            variant="outlined"
          />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            sx={{
              mt: 1,
              border: "2px solid",
              borderColor: "black",
              background: "#FFFFFF",
              width: 500,
            }}
            id="outlined-basic"
            label="Password"
            variant="outlined"
          />
          <TextField
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            sx={{
              mt: 1,
              border: "2px solid",
              borderColor: "black",
              background: "#FFFFFF",
              width: 500,
            }}
            id="outlined-basic"
            label="Confirm Password"
            variant="outlined"
          />
          <Button
            sx={{ mt: 1, width: 500, height: 50 }}
            onClick={handleSubmit}
            variant="outlined"
            href="/SignIn"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>


      </Container>
    </ThemeProvider>
  );
}