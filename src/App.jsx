import { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminAppointments from "./componants/AdminAppointments";
import AdminDashboard from "./componants/AdminDashboard";
import LandingPage from "./componants/LandingPage";
import AuthPage from "./componants/AuthPage";
import UserDashboard from "./componants/UserDashboard";
import UserAppointments from "./componants/UserAppointments";
import BookAppointment from "./componants/BookAppointment";
import Navbar from "./componants/Navbar";
import AdminServices from "./componants/AdminServices";
import AdminBarbers from "./componants/AdminBarbers";
import AdminUsers from "./componants/AdminUsers";
import Footer from "./componants/Footer";

function RequireAuth({ allowRole, redirectTo = "/login", children }) {
  const userId = sessionStorage.getItem("user_id");
  const role = (sessionStorage.getItem("role") || "").toLowerCase();

  if (!userId) return <Navigate to={redirectTo} replace />;

  if (allowRole && role !== allowRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const role = (sessionStorage.getItem("role") || "").toLowerCase();
    const email = sessionStorage.getItem("email") || "";

    if (userId) {
      setIsAuthenticated(true);
      setIsAdmin(role === "admin");
      setUserEmail(email);
    }
  }, []);
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
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("full_name");
    sessionStorage.removeItem("email");
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
            <RequireAuth allowRole="user">
              <UserDashboard userName={userName} />
            </RequireAuth>
          }
        />

        <Route
          path="/book"
          element={
            <RequireAuth allowRole="user">
              <BookAppointment />
            </RequireAuth>
          }
        />

        <Route
          path="/appointments"
          element={
            <RequireAuth allowRole="user">
              <UserAppointments />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth allowRole="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <RequireAuth allowRole="admin">
              <AdminAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/services"
          element={
            <RequireAuth allowRole="admin">
              <AdminServices />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/barbers"
          element={
            <RequireAuth allowRole="admin">
              <AdminBarbers />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth allowRole="admin">
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
