import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import ActionModal from "./ActionModal";

function AuthPage({ mode, onAuth }) {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL;
    const adminemail = import.meta.env.VITE_ADMINEMAIL;
    const adminpws = import.meta.env.VITE_ADMINPWS;

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "OK",
        cancelText: null,
        danger: false,
        onConfirm: null,
    });

    const closeModal = () => setModal((m) => ({ ...m, open: false }));

    const showInfo = ({ title, message }) => {
        setModal({
            open: true,
            title,
            message,
            confirmText: "OK",
            cancelText: null,
            danger: false,
            onConfirm: closeModal,
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (mode === "signup" && !formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const url =
            mode === "login" ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/signup`;

        const body =
            mode === "login"
                ? { email: formData.email, password: formData.password }
                : { full_name: formData.name, email: formData.email, password: formData.password };
        setLoading(true);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });


        if (!res.ok) {
            let msg = "Something went wrong. Please try again.";
            if (res.status === 401) msg = "Invalid email or password.";
            if (res.status === 400) msg = "Email already used.";
            showInfo({ title: "Authentication Failed", message: msg });
            setLoading(false);
            return;
        }

        const user = await res.json();
        setLoading(false);
        const isAdmin =
            String(formData.email).toLowerCase() === String(adminemail).toLowerCase() &&
            String(formData.password) === String(adminpws);

        localStorage.setItem("user_id", String(user.user_id));
        localStorage.setItem("role", user.role);
        localStorage.setItem("full_name", user.full_name);

        onAuth(user.email, isAdmin, user.user_id, user);

        navigate(isAdmin ? "/admin" : "/dashboard");


    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-md p-8">
                        <h2 className="text-center text-gray-900 mb-2">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h2>

                        <p className="text-center text-gray-600 mb-8">
                            {mode === "login"
                                ? "Login to manage your appointments"
                                : "Sign up to start booking appointments"}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === "signup" && (
                                <div>
                                    <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                                        Full Name
                                    </label>

                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            className={
                                                "w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-colors " +
                                                (errors.name
                                                    ? "border-red-500"
                                                    : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent")
                                            }
                                        />
                                    </div>

                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                                    Email Address
                                </label>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className={
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-colors " +
                                            (errors.email
                                                ? "border-red-500"
                                                : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent")
                                        }
                                    />
                                </div>

                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                                    Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter your password"
                                        className={
                                            "w-full pl-10 pr-12 py-2.5 border rounded-lg outline-none transition-colors " +
                                            (errors.password
                                                ? "border-red-500"
                                                : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent")
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors shadow-md"
                            >
                                {mode === "login" ? "Login" : "Sign Up"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                <Link
                                    to={mode === "login" ? "/signup" : "/login"}
                                    className="text-amber-700 hover:text-amber-800"
                                >
                                    {mode === "login" ? "Sign Up" : "Login"}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ActionModal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                danger={modal.danger}
                onConfirm={modal.onConfirm || closeModal}
                onClose={closeModal}
            />
        </>
    );
}

export default AuthPage;
