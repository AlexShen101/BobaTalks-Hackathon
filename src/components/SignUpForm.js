import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import '../styles/style.css';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';

import theme from '../theme.js';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    try {
      setLoading(true);
      await signup({ email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500); // Give time for success message to show
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
            sx={{ mt: 1 }}
            onClick={handleSubmit}
            color="custom"
            variant="outlined"
            href="/SignIn"
          >
            {" "}
            Register{" "}
          </Button>
        </form>;


      </Container>
    </ThemeProvider>
  );
}