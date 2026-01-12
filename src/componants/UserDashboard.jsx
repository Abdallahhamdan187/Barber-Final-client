import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Clock, Check, X, AlertCircle } from "lucide-react";
import ActionModal from "./ActionModal";


const normalizeDate = (d) => (d ? String(d).split("T")[0] : "");
function UserDashboard({ }) {
    const [appointments, setAppointments] = useState([]);
    const userId = localStorage.getItem("user_id")
    const username = localStorage.getItem("full_name")
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "OK",
        cancelText: null,
        danger: false,
        onConfirm: null,
    });

    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${baseUrl}/api/users/${userId}/appointments`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Appointments:", data);
                setAppointments(data);
            })
            .catch((err) => console.error(err));
    }, [baseUrl, userId]);

    const upcomingAppointments = appointments.filter((apt) => {
        return apt.status === "Approved" || apt.status === "Pending";
    });

    const pastAppointments = appointments.filter((apt) => {
        return apt.status === "Completed" || apt.status === "Cancelled" || apt.status === "Rejected";
    });
    const closeModal = () => setModal((m) => ({ ...m, open: false }));
    const showConfirmCancel = (appointmentId) => {
        setModal({
            open: true,
            title: "Cancel Appointment",
            message: "Are you sure you want to cancel this appointment?",
            confirmText: "Yes, Cancel",
            cancelText: "No",
            danger: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(
                        `${baseUrl}/api/users/${userId}/appointments/${appointmentId}/cancel`,
                        { method: "PUT" }
                    );
                    const updated = await res.json();
                    if (res.ok) {
                        setAppointments((prev) =>
                            prev.filter((apt) => apt.appointment_id !== appointmentId)
                        );
                    }
                    closeModal();
                } catch (err) {
                    console.error(err);
                    closeModal();
                }
            },
        });
    };
    const handleCancel = (id) => {

        showConfirmCancel(id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Completed":
                return "bg-blue-100 text-blue-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Approved":
                return <Check className="w-4 h-4" />;
            case "Pending":
                return <Clock className="w-4 h-4" />;
            case "Cancelled":
                return <X className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">Welcome back, {username}!</h1>
                    <p className="text-gray-600">
                        Manage your appointments and book new services
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700">Upcoming</h3>
                            <Calendar className="w-5 h-5 text-amber-700" />
                        </div>
                        <p className="text-gray-900">{upcomingAppointments.length}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Scheduled appointments
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-700">Past Visits</h3>
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-gray-900">{pastAppointments.length}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Completed services
                        </p>
                    </div>

                    <div className="bg-amber-700 rounded-xl p-6 shadow-sm text-white">
                        <h3 className="mb-2">Need a Fresh Cut?</h3>
                        <Link
                            to="/book"
                            className="inline-block px-4 py-2 bg-white text-amber-700 rounded-lg hover:bg-gray-100 transition-colors mt-2"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-gray-900">Upcoming Appointments</h2>
                    </div>

                    <div className="p-6">
                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAppointments.map((appointment) => {
                                    return (
                                        <div
                                            key={appointment.appointment_id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="text-gray-900">{appointment.service_name}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    with {appointment.barber_name}
                                                </p>

                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {normalizeDate(appointment.appt_date)}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {appointment.appt_time}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={
                                                        "flex items-center gap-1 px-3 py-1 rounded-full text-sm " +
                                                        getStatusColor(appointment.status)
                                                    }
                                                >
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status}
                                                </span>

                                                {(appointment.status === "Pending" || appointment.status === "Approved") && (
                                                    <button
                                                        onClick={() => handleCancel(appointment.appointment_id)}
                                                        className="px-3 py-1 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                No upcoming appointments. Book one now!
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-foreground">Past Appointments</h2>

                        <Link to="/appointments" className="text-foreground hover:opacity-80 text-sm">
                            View All
                        </Link>
                    </div>

                    <div className="p-6">
                        {pastAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {pastAppointments.map((appointment) => {
                                    return (
                                        <div
                                            key={appointment.appointment_id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="text-gray-900">{appointment.service_name}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {normalizeDate(appointment.appt_date)} • {appointment.appt_time}
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm " +
                                                    getStatusColor(appointment.status)
                                                }
                                            >
                                                {getStatusIcon(appointment.status)}
                                                {appointment.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                No past appointments
                            </p>
                        )}
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
        </div>

    );
}

export default UserDashboard;
