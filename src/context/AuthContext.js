import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchUser() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/api/auth/me`,
          { withCredentials: true });

        console.log(response)

        if (response.status === 200) {
          let userData = response.data.user;
          setUser(userData)
          setLoading(false);
        }
      } catch (error) {
        console.log('No User Found:', error.response ? error.response.data : error.message);
        setUser(null);
        setLoading(false);
      }
    }

    fetchUser();
  }, [])

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/auth/signup`, userData);
      console.log(response);

      if (response.status === 201) {
        const response2 = await login(userData)
        console.log(response2);
        return response2;
      } else {
        console.log("error creating user?");
      }
    } catch (error) {
      return error;
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

      if (response.status === 200) {
        let userData = response.data.user;
        setUser(userData)
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/auth/logout`,
        {},  // empty body
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUser(null);
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
