import { useEffect, useState } from "react";
import { Calendar, Clock, User, Check, X, AlertCircle, Eye } from "lucide-react";
import ActionModal from "./ActionModal";//for massages 

const normalizeDate = (d) => (d ? String(d).split("T")[0] : "");

function UserAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const userId = localStorage.getItem("user_id")

    const baseUrl = import.meta.env.VITE_API_URL;
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "OK",
        cancelText: null,
        danger: false,
        onConfirm: null,
    });

    useEffect(() => {
        fetch(`${baseUrl}/api/users/${userId}/appointments`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Appointments:", data);
                setAppointments(data);
            })
            .catch((err) => console.error(err));
    }, [baseUrl, userId]);

    const closeModal = () => setModal((m) => ({ ...m, open: false }));

    const showConfirmCancel = (appointmentId) => {
        setModal({
            open: true,
            title: "Delete Appointment",
            message: "Are you sure you want to delete this appointment?",
            confirmText: "Yes, Delete",
            cancelText: "No",
            danger: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(
                        `${baseUrl}/api/users/${userId}/appointments/${appointmentId}/Delete`,
                        { method: "DELETE" }
                    );
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

    const toggleDetails = (id) => {
        if (selectedAppointment === id) setSelectedAppointment(null);
        else setSelectedAppointment(id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 border border-green-200";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case "Completed":
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case "Cancelled":
                return "bg-red-100 text-red-800 border border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
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
        <>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-gray-900 mb-2">My Appointments</h1>
                        <p className="text-gray-600">View and manage all your appointments</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Service</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Barber</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Price</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {appointments
                                        .filter(
                                            (a) =>
                                                a.status === "Rejected" ||
                                                a.status === "Cancelled" ||
                                                a.status === "Completed"
                                        )
                                        .map((appointment) => (
                                            <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-gray-900">{appointment.service_name}</p>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-700">{appointment.barber_name}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>{normalizeDate(appointment.appt_date)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span>{appointment.appt_time}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-900">{appointment.price_at_booking}</span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={
                                                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm " +
                                                            getStatusColor(appointment.status)
                                                        }
                                                    >
                                                        {getStatusIcon(appointment.status)}
                                                        {appointment.status}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleDetails(appointment.appointment_id)}
                                                            className="p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleCancel(appointment.appointment_id)}
                                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>

                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-gray-200">
                            {appointments.map((appointment) => (
                                <div key={appointment.appointment_id} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-gray-900 mb-1">{appointment.service_name}</p>
                                            <p className="text-sm text-gray-600">{appointment.barber_name}</p>
                                        </div>

                                        <span
                                            className={
                                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm " +
                                                getStatusColor(appointment.status)
                                            }
                                        >
                                            {getStatusIcon(appointment.status)}
                                            {appointment.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {appointment.appt_date}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {appointment.appt_time}
                                        </div>

                                        <div className="text-gray-900">{appointment.price_at_booking}</div>
                                    </div>


                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedAppointment && (
                        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {appointments
                                .filter((a) => a.appointment_id === selectedAppointment)
                                .map((a) => (
                                    <div key={a.appointment_id}>
                                        <h2 className="text-gray-900 mb-2">Appointment Details</h2>
                                        <p className="text-gray-700">Service: {a.service_name}</p>
                                        <p className="text-gray-700">Barber: {a.barber_name}</p>
                                        <p className="text-gray-700">
                                            Date: {a.appt_date} — {a.appt_time}
                                        </p>
                                        <p className="text-gray-700">Price: {a.price_at_booking}</p>
                                        <p className="text-gray-700">Status: {a.status}</p>

                                    </div>
                                ))}
                        </div>
                    )}
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

export default UserAppointments;
