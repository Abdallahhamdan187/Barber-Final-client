import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Scissors, User, Check, Star, ArrowRight } from "lucide-react";
import ActionModal from "./ActionModal";


const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM",
];


function BookAppointment() {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL;
    const userId = localStorage.getItem("user_id");

    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);

    const [selectedService, setSelectedService] = useState("");
    const [selectedBarber, setSelectedBarber] = useState("");

    const [selectedDate, setSelectedDate] = useState("");//no double appointment on same date
    const [selectedTime, setSelectedTime] = useState("");//no double appointment on same time

    useEffect(() => {
        // Fetch services
        fetch(`${baseUrl}/api/users/services`)
            .then((res) => res.json())
            .then((data) => setServices(data))
            .catch((err) => console.error("Error fetching services:", err));
        // Fetch barbers
        fetch(`${baseUrl}/api/users/barbers`)
            .then((res) => res.json())
            .then((data) => setBarbers(data))
            .catch((err) => console.error("Error fetching barbers:", err));
    }, [baseUrl]);

    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const closeModal = () => setModal((m) => ({ ...m, open: false }));

    const showSuccessAndGoDashboard = () => {
        setModal({
            open: true,
            title: "Appointment Booked",
            message: "Appointment booked successfully! You will be notified once approved.",
            onConfirm: () => {
                closeModal();
                navigate("/dashboard");
            },
        });
    };

    const selectedServiceData = services.find((s) => String(s.service_id) === String(selectedService));
    const isFormValid = selectedService !== "" && selectedBarber !== "" && selectedDate && selectedTime;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            const res = await fetch(`${baseUrl}/api/users/${userId}/appointments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: Number(selectedService),
                    barber_id: Number(selectedBarber),
                    appt_date: selectedDate,
                    appt_time: selectedTime,
                    notes: null,
                }),
            });

            if (res.status === 409) {
                setModal({
                    open: true,
                    title: "Time Slot Unavailable",
                    message: "This time slot is already booked. Please choose another time.",
                    onConfirm: closeModal,
                });
                return;
            }

            if (!res.ok) {
                setModal({
                    open: true,
                    title: "Booking Failed",
                    message: "An error occurred while booking your appointment. Please try again later.",
                    onConfirm: closeModal,
                });
                return;
            }

            showSuccessAndGoDashboard();
        } catch (error) {
            setModal({
                open: true,
                title: "Booking Failed",
                message: "An error occurred while booking your appointment. Please try again later.",
                onConfirm: closeModal,
            });
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-gray-900 mb-2">Book an Appointment</h1>
                        <p className="text-gray-600 mb-6">Choose your service, barber, and preferred time</p>

                        <div className="flex items-center gap-4">
                            <div className={"flex items-center gap-2 " + (selectedService ? "text-amber-700" : "text-gray-400")}>
                                <div className={"w-8 h-8 rounded-full flex items-center justify-center " + (selectedService ? "bg-amber-700 text-white" : "bg-gray-200")}>
                                    {selectedService ? <Check className="w-4 h-4" /> : "1"}
                                </div>
                                <span className="text-sm hidden sm:inline">Service</span>
                            </div>

                            <div className={"h-0.5 w-12 " + (selectedBarber ? "bg-amber-700" : "bg-gray-200")} />

                            <div className={"flex items-center gap-2 " + (selectedBarber ? "text-amber-700" : "text-gray-400")}>
                                <div className={"w-8 h-8 rounded-full flex items-center justify-center " + (selectedBarber ? "bg-amber-700 text-white" : "bg-gray-200")}>
                                    {selectedBarber ? <Check className="w-4 h-4" /> : "2"}
                                </div>
                                <span className="text-sm hidden sm:inline">Barber</span>
                            </div>

                            <div className={"h-0.5 w-12 " + (selectedDate && selectedTime ? "bg-amber-700" : "bg-gray-200")} />

                            <div className={"flex items-center gap-2 " + (selectedDate && selectedTime ? "text-amber-700" : "text-gray-400")}>
                                <div className={"w-8 h-8 rounded-full flex items-center justify-center " + (selectedDate && selectedTime ? "bg-amber-700 text-white" : "bg-gray-200")}>
                                    {selectedDate && selectedTime ? <Check className="w-4 h-4" /> : "3"}
                                </div>
                                <span className="text-sm hidden sm:inline">Date & Time</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Service */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-amber-700" />
                                </div>
                                <h2 className="text-gray-900">Select Service</h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {services.map((service) => {
                                    const isSelected = String(selectedService) === String(service.service_id);
                                    return (
                                        <button
                                            key={service.service_id}
                                            type="button"
                                            onClick={() => setSelectedService(String(service.service_id))}
                                            className={
                                                "relative p-6 rounded-xl border-2 text-left transition-all " +
                                                (isSelected
                                                    ? "border-amber-700 bg-gradient-to-br from-amber-50 to-white shadow-md"
                                                    : "border-gray-200 hover:border-amber-300 hover:shadow-sm")
                                            }
                                        >

                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-gray-900">{service.name}</h3>

                                                {isSelected && (
                                                    <div className="w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                <span className="text-xl text-amber-700">{service.price}$</span>
                                                <span className="text-sm text-gray-500">{service.duration_min}min</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Barber */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-amber-700" />
                                </div>
                                <h2 className="text-gray-900">Select Barber</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {barbers
                                    .filter((b) => b.is_active === true || b.isactive === true)
                                    .map((barber) => {
                                        const isSelected = String(selectedBarber) === String(barber.barber_id);

                                        return (
                                            <button
                                                key={barber.barber_id}
                                                type="button"
                                                onClick={() => setSelectedBarber(String(barber.barber_id))}
                                                className={
                                                    "p-5 rounded-xl border-2 text-left transition-all " +
                                                    (isSelected
                                                        ? "border-amber-700 bg-gradient-to-br from-amber-50 to-white shadow-md"
                                                        : "border-gray-200 hover:border-amber-300 hover:shadow-sm")
                                                }
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white flex-shrink-0 shadow-md">

                                                        {barber.name?.slice(0, 2).toUpperCase()}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="text-gray-900">{barber.name}</h3>

                                                            {isSelected && (
                                                                <div className="w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2">{barber.specialization}</p>

                                                        <div className="flex items-left  gap-2 text-sm text-gray-500">
                                                            <div className="flex items-left gap-20">
                                                                <span>Working hour: {barber.working_hours}</span>

                                                                <span>Phone: {barber.phone}</span>
                                                            </div>


                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-700" />
                                </div>
                                <h2 className="text-gray-900">Select Date & Time</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="date" className="block text-sm text-gray-700 mb-3">
                                        Choose Date
                                    </label>

                                    <input
                                        id="date"
                                        type="date"
                                        min={today}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="time" className="block text-sm text-gray-700 mb-3">
                                        Choose Time Slot
                                    </label>

                                    <select
                                        id="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    >
                                        <option value="">Select a time</option>
                                        {timeSlots.map((slot) => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedDate && selectedTime && (
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-amber-700 mt-0.5" />

                                        <div>
                                            <p className="text-sm text-amber-900 mb-1">
                                                <strong>Your appointment is scheduled for:</strong>
                                            </p>

                                            <p className="text-amber-800">
                                                {new Date(selectedDate).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}{" "}
                                                at {selectedTime}
                                            </p>

                                            {selectedServiceData && (
                                                <p className="text-sm text-amber-700 mt-2">
                                                    Duration: {selectedServiceData.duration_min} min • Price: {selectedServiceData.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={
                                    "px-8 py-3 rounded-xl text-white transition-all flex items-center gap-2 " +
                                    (isFormValid
                                        ? "bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 shadow-lg hover:shadow-xl"
                                        : "bg-gray-300 cursor-not-allowed")
                                }
                            >
                                Book Appointment
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <ActionModal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                confirmText="OK"
                onConfirm={modal.onConfirm || closeModal}
                onClose={closeModal}
            />
        </>
    );
}

export default BookAppointment;
