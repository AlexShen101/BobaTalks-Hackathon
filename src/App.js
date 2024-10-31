import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import DonatePage from "./pages/DonatePage";
import BobaVendorsPage from "./pages/BobaVendorsPage";
import ManageEventPage from "./pages/ManageEventPage";
import EditEventPage from "./pages/EditEventsPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ViewEventPage from "./pages/ViewEventPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";

const App = () => {
  console.log(process.env);
  console.log('ENV:', process.env.REACT_APP_ENV);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/EventsPage"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EventsPage/:id"
              element={
                <ProtectedRoute>
                  <ViewEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donate/:id"
              element={
                <ProtectedRoute>
                  <DonatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CreateEventPage"
              element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/BobaVendorsPage"
              element={
                <ProtectedRoute>
                  <BobaVendorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManageEventPage"
              element={
                <ProtectedRoute>
                  <ManageEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManageEventPage/EditEvent/:id"
              element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignUp" element={<SignUp />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
