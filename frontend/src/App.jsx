import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TenantProfile from './pages/TenantProfile';
import RentDetails from './pages/RentDetails';
import PayRent from './pages/PayRent';
import WiFiDetails from './pages/WiFiDetails';
import ChessLobby from './pages/ChessLobby';
import ChessGame from './pages/ChessGame';
import Complaints from './pages/Complaints';
import AdminComplaints from './pages/AdminComplaints';
import SpeedTest from './pages/SpeedTest';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute roles={['TENANT']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['OWNER']}>
              <AdminPanel />
            </PrivateRoute>
          } />
          <Route path="/admin/complaints" element={
            <PrivateRoute roles={['OWNER']}>
              <AdminComplaints />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <TenantProfile />
            </PrivateRoute>
          } />
          <Route path="/rent" element={
            <PrivateRoute roles={['TENANT']}>
              <RentDetails />
            </PrivateRoute>
          } />
          <Route path="/pay-rent" element={
            <PrivateRoute roles={['TENANT']}>
              <PayRent />
            </PrivateRoute>
          } />
          <Route path="/wifi" element={
            <PrivateRoute roles={['TENANT']}>
              <WiFiDetails />
            </PrivateRoute>
          } />
          <Route path="/chess" element={
            <PrivateRoute roles={['TENANT']}>
              <ChessLobby />
            </PrivateRoute>
          } />
          <Route path="/chess/:roomId" element={
            <PrivateRoute roles={['TENANT']}>
              <ChessGame />
            </PrivateRoute>
          } />
          <Route path="/complaints" element={
            <PrivateRoute roles={['TENANT']}>
              <Complaints />
            </PrivateRoute>
          } />
          <Route path="/speed-test" element={
            <PrivateRoute roles={['TENANT']}>
              <SpeedTest />
            </PrivateRoute>
          } />
          <Route path="/" element={
            user ? (
              user.role === 'OWNER' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
