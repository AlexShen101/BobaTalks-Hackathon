import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";

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
import OrganizerSignup from "./pages/OrganizerSignup";
import SemanticSearchPage from "./pages/SemanticSearchPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";

const routes = [
  { path: "/", element: <Home /> },
  {
    path: "/EventsPage",
    element: <EventsPage />,
    protected: true
  },
  {
    path: "/EventsPage/:id",
    element: <ViewEventPage />,
    protected: true
  },
  {
    path: "/donate/:id",
    element: <DonatePage />,
    protected: true
  },
  {
    path: "/CreateEventPage",
    element: <CreateEventPage />,
    protected: true
  },
  {
    path: "/BobaVendorsPage",
    element: <BobaVendorsPage />,
    protected: true
  },
  {
    path: "/ManageEventPage",
    element: <ManageEventPage />,
    protected: true
  },
  {
    path: "/ManageEventPage/EditEvent/:id",
    element: <EditEventPage />,
    protected: true
  },
  {
    path: "/SemanticSearch",
    element: <SemanticSearchPage />,
    protected: true
  },
  {
    path: "/Organizer-Signup",
    element: <OrganizerSignup />
  },
  {
    path: "/SignIn",
    element: <SignIn />
  },
  {
    path: "/SignUp",
    element: <SignUp />
  }
]

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AlertProvider>
          <Router>
            <Navbar />
            <Routes>
              {routes.map(({ path, element, protected: isProtected }) => (
                <Route
                  key={path}
                  path={path}
                  element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
                />
              ))}
            </Routes>
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
