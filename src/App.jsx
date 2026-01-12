import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminAppointments from "./components/AdminAppointments";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import UserDashboard from "./components/UserDashboard";
import UserAppointments from "./components/UserAppointments";
import BookAppointment from "./components/BookAppointment";
import Navbar from "./components/Navbar";
import AdminServices from "./components/AdminServices";
import AdminBarbers from "./components/AdminBarbers";
import AdminUsers from "./components/AdminUsers";
import Footer from "./components/Footer";

function RequireAuth({ allowed, redirectTo = "/login", children }) {
  return allowed ? children : <Navigate to={redirectTo} replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState(null);

  const userName = useMemo(() => {
    if (!userEmail) return "User";
    return userEmail.split("@")[0];
  }, [userEmail]);

  const login = (email, admin) => {
    setIsAuthenticated(true);
    setIsAdmin(Boolean(admin));
    setUserEmail(email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={logout} />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
            ) : (
              <AuthPage mode="login" onAuth={login} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
            ) : (
              <AuthPage mode="signup" onAuth={login} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth allowed={isAuthenticated && !isAdmin}>
              <UserDashboard userName={userName} />
            </RequireAuth>
          }
        />

        <Route
          path="/book"
          element={
            <RequireAuth allowed={isAuthenticated && !isAdmin}>
              <BookAppointment />
            </RequireAuth>
          }
        />

        <Route
          path="/appointments"
          element={
            <RequireAuth allowed={isAuthenticated && !isAdmin}>
              <UserAppointments />
            </RequireAuth>
          }
        />


        <Route
          path="/admin"
          element={
            <RequireAuth allowed={isAuthenticated && isAdmin}>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <RequireAuth allowed={isAuthenticated && isAdmin}>
              <AdminAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/services"
          element={
            <RequireAuth allowed={isAuthenticated && isAdmin}>
              <AdminServices />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/barbers"
          element={
            <RequireAuth allowed={isAuthenticated && isAdmin}>
              <AdminBarbers />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth allowed={isAuthenticated && isAdmin}>
              <AdminUsers />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
export default App;
