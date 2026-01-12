import { Link, useLocation } from "react-router-dom";
import { Scissors, LogOut, } from "lucide-react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from "react";

function Navbar({ isAuthenticated, isAdmin, onLogout }) {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    const [weatherData, setWeatherData] = useState(null);
    const myApi = import.meta.env.VITE_WEATHER_API_KEY;
    const baseUrl = `https://api.weatherapi.com/v1/current.json?key=${myApi}&q=Amman&aqi=no`;
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(baseUrl);
                const data = await response.json();

                setWeatherData(data);
              
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        }
        fetchWeather();
    }, [baseUrl]);


    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {isAuthenticated && (
                        <div className="flex items-center gap-4">
                            {weatherData?.current?.temp_c !== undefined && (
                                <span className="ml-2 text-sm font-medium text-gray-600">
                                    The temp is: {weatherData.current.temp_c}°C
                                </span>
                            )}
                            {!isAdmin && (
                                <>
                                    <Link to="/dashboard" className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-md">
                                            <Scissors className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl font-semibold text-gray-900">
                                            7LE8HA
                                        </span>
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <Link to="/admin" className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-md">
                                            <Scissors className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl font-semibold text-gray-900">
                                            7LE8HA
                                        </span>
                                    </Link>

                                </>
                            )}
                        </div>
                    )}
                    {isLandingPage ? null : (
                        <>
                            {isAuthenticated && (
                                <div className="flex items-center gap-4">

                                    {!isAdmin && (
                                        <>
                                            <Link
                                                to="/dashboard"
                                                className="px-3 py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                            >
                                                Dashboard
                                            </Link>

                                            <Link
                                                to="/book"
                                                className="px-3 py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                            >
                                                Book Appointment
                                            </Link>
                                        </>
                                    )}


                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                                            <AccountCircleIcon sx={{ color: "white", fontSize: 20 }} />                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {isAdmin ? "Admin" : "User"}
                                        </span>
                                    </div>


                                    <button
                                        onClick={onLogout}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
