import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Scissors, Clock, Users, Award, Star, ChevronRight } from "lucide-react";

function LandingPage() {
    const letters = [1, 2, 3];
    const [services, setServices] = useState([]);
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${baseUrl}/api/users/services`)
            .then((res) => res.json())
            .then((data) => {

                // if i only want active services
                const activeOnly = Array.isArray(data)
                    ? data.filter((s) => s.is_active === true || s.is_active === "true")
                    : [];
                setServices(activeOnly);
            })
            .catch((err) => console.error("Error fetching services:", err));
    }, [baseUrl]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-700 opacity-20 blur-3xl rounded-full"></div>
                            <Scissors className="relative w-20 h-20 text-amber-700" />
                        </div>
                    </div>

                    <h1 className="text-gray-900 mb-4">7LE8HA</h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Book Your Style with Ease
                    </p>

                    <p className="text-gray-500 mb-10 max-w-xl mx-auto">
                        Experience premium grooming services from expert barbers. Schedule
                        appointments, manage bookings, and look your best with just a few
                        clicks.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link
                            to="/login"
                            className="px-8 py-3 border-2 border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 transition-all hover:scale-105 hover:shadow-md flex items-center gap-2"
                        >
                            login
                            <ChevronRight className="w-4 h-4" />
                        </Link>

                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            Sign Up
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="mt-12 flex justify-center items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {letters.map((i) => {
                                    return (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white flex items-center justify-center text-white text-xs"
                                        >
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    );
                                })}
                            </div>
                            <span>500+ Happy Customers</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => {
                                return (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 fill-amber-500 text-amber-500"
                                    />
                                );
                            })}
                            <span className="ml-2">4.9/5 Rating</span>
                        </div>
                    </div>
                </div>
                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-gray-900 mb-3">Our Services</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our range of professional grooming services
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {services.length === 0 ? (
                            <div className="md:col-span-3 text-center text-gray-500 py-10">
                                No services available right now.
                            </div>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service.service_id}
                                    className="group bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:border-amber-700 transition-all hover:shadow-lg"
                                >
                                    <div className="mb-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-700 transition-colors">
                                            <Scissors className="w-6 h-6 text-amber-700 group-hover:text-white transition-colors" />
                                        </div>

                                        <h3 className="text-gray-900 mb-2">{service.name}</h3>
                                    </div>

                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {service.description || "Professional grooming service"}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-2xl text-amber-700">${service.price}</span>
                                        <span className="text-sm text-gray-500">~{service.duration_min} min</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="w-7 h-7 text-amber-700" />
                        </div>
                        <h3 className="mb-2 text-gray-900">Easy Booking</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Schedule your appointment in just a few clicks. Choose your
                            preferred time and barber.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-amber-700 text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">

                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-amber-700" />
                        </div>
                        <h3 className="mb-2 text-gray-900">Expert Barbers</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Our skilled professionals are dedicated to giving you the perfect
                            style every time.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-amber-700 text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">

                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-4">
                            <Award className="w-7 h-7 text-amber-700" />
                        </div>
                        <h3 className="mb-2 text-gray-900">Quality Service</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Premium cuts and grooming services tailored to your unique style
                            preferences.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-amber-700 text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">

                            </span>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
}

export default LandingPage;
