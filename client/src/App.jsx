import { Routes, Route } from "react-router-dom";
import PageTitle from "./components/PageTitle";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import Dashboard from "./pages/agent/Dashboard";
import Team from "./pages/agent/Team";
import Withdraw from "./pages/agent/Withdraw";
import Settings from "./pages/agent/Settings";
import LoadSharedCapitalPage from "./pages/admin/LoadSharedCapitalPage";
import PendingRegistrations from './pages/admin/PendingRegistrations';
import EarningsWithdrawals from './pages/admin/EarningsWithdrawals';
import EarningHistoryPage from './pages/admin/EarningHistoryPage';
import SharedWithdrawal from './pages/admin/SharedWithdrawal';
import SharedHistory from './pages/admin/SharedHistory';
import AdminSettings from './pages/admin/Settings';
import PaymentMethods from './pages/agent/PaymentMethods';
import AllUsers from './pages/admin/AllUsers';

// Theme customization
const theme = extendTheme({
  colors: {
    brand: {
      primary: "#FDB137",
      400: "#FDB137",
      500: "#FDB137",
      600: "#BD5301",
    },
    bg: {
      primary: "#1E2528",
      secondary: "#181E20",
    },
    text: {
      primary: "#E0E0E0",
      secondary: "#A0A0A0",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#181E20",
        color: "#E0E0E0",
      },
    },
  },
});

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/pending-registration" 
          element={
            <PrivateRoute>
              <PendingRegistrations />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/load-shared-capital" 
          element={
            <PrivateRoute>
              <LoadSharedCapitalPage />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/earnings-withdrawals"
          element={
            <PrivateRoute>
              <EarningsWithdrawals />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/earning-history"
          element={
            <PrivateRoute>
              <EarningHistoryPage />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/shared-withdrawal" 
          element={
            <PrivateRoute>
              <SharedWithdrawal />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/shared-history" 
          element={
            <PrivateRoute>
              <SharedHistory />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/settings" 
          element={
            <PrivateRoute>
              <AdminSettings />
            </PrivateRoute>
          }
        />
        <Route 
          path="/admin/all-users" 
          element={
            <PrivateRoute>
              <AllUsers />
            </PrivateRoute>
          }
        />

        {/* Agent Routes */}
        <Route 
          path="/agent" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/agent/team" 
          element={
            <PrivateRoute>
              <Team />
            </PrivateRoute>
          }
        />
        <Route 
          path="/agent/withdraw" 
          element={
            <PrivateRoute>
              <Withdraw />
            </PrivateRoute>
          }
        />
        <Route 
          path="/agent/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route 
          path="/agent/payment-methods" 
          element={
            <PrivateRoute>
              <PaymentMethods />
            </PrivateRoute>
          }
        />
      </Routes>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <PageTitle />
        <AppRoutes />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
