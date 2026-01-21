import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActionModal from "./ActionModal";
import {
    Calendar,
    Users,
    Scissors,
    TrendingUp,
    Check,
    X,
    Trash2,
    Filter,
    Search,
} from "lucide-react";


const normalizeDate = (d) => (d ? String(d).split("T")[0] : "");// Normalize date to YYYY-MM-DD format

function AdminAppointments() {

    const baseUrl = import.meta.env.VITE_API_URL;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setLoading(true);

        fetch(`${baseUrl}/api/admin/appointments`, {
            headers: {
                "x-role": sessionStorage.getItem("role"),
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setAppointments(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching appointments:", err);
                setAppointments([]);
                setLoading(false);
            });
    }, [baseUrl]);

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


    const showConfirm = ({ title, message, confirmText, danger, action }) => {
        setModal({
            open: true,
            title,
            message,
            confirmText,
            cancelText: "Cancel",
            danger: !!danger,
            onConfirm: () => {
                action();
                closeModal();
            },
        });
    };

    const handleApprove = (id) => {
        fetch(`${baseUrl}/api/admin/appointments/${id}/approve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-role": sessionStorage.getItem("role") },
            body: JSON.stringify({ approved_by: null }),
        })
            .then((res) => res.json())
            .then(() => {
                setAppointments((prev) =>
                    prev.map((apt) =>
                        apt.appointment_id === id ? { ...apt, status: "Approved" } : apt
                    )
                );
            }).catch((err) => {
                console.error("Error approving appointment:", err);
            });

    };

    const handleReject = (id) => {

        showConfirm({
            title: "Reject Appointment",
            message: "Are you sure you want to reject this appointment?",
            confirmText: "Reject",
            danger: true,
            action: () => {
                fetch(`${baseUrl}/api/admin/appointments/${id}/reject`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "x-role": sessionStorage.getItem("role") },

                    body: JSON.stringify({ approved_by: null }),
                })
                    .then((res) => res.json())
                    .then(() => {
                        setAppointments((prev) =>
                            prev.map((apt) =>
                                apt.appointment_id === id ? { ...apt, status: "Rejected" } : apt
                            )
                        );
                    }).catch((err) => {
                        console.error("Error rejecting appointment:", err);
                    });
            },
        });
    };
    const handleComplete = async (appointmentId) => {
        try {
            const res = await fetch(`${baseUrl}/api/admin/appointments/${appointmentId}/complete`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-role": sessionStorage.getItem("role") },
                body: JSON.stringify({ completed_by: null }),
            });
            const updated = await res.json();
            setAppointments((prev) =>
                prev.map((a) => (a.appointment_id === appointmentId ? updated : a))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to mark appointment as completed");
        }
    };
    const handleDelete = (id) => {

        showConfirm({
            title: "Delete Appointment",
            message: "Are you sure you want to delete this appointment? This action cannot be undone.",
            confirmText: "Delete",
            danger: true,
            action: () => {
                fetch(`${baseUrl}/api/admin/appointments/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-role": sessionStorage.getItem("role"),
                    },
                })
                    .then((res) => res.json())
                    .then(() => {
                        setAppointments((prev) =>
                            prev.filter((apt) => apt.appointment_id !== id)
                        );
                    })
                    .catch((err) => {
                        console.error("Error deleting appointment:", err);
                    });
            },
        });
    };

    const clearFilters = () => {
        setFilterStatus("All");
        setFilterDate("");
        setSearchTerm("");
    };

    const filteredAppointments = appointments.filter((apt) => {
        const matchesStatus = filterStatus === "All" || apt.status === filterStatus;

        const matchesDate =
            !filterDate || normalizeDate(apt.appt_date) === filterDate;

        const customer = (apt.customer || "").toLowerCase();
        const service = (apt.service || "").toLowerCase();
        const barber = (apt.barber || "").toLowerCase();
        const term = searchTerm.toLowerCase();

        const matchesSearch =
            customer.includes(term) || service.includes(term) || barber.includes(term);//Search in customer, service, and barber

        return matchesStatus && matchesDate && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 border border-green-200";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case "Completed":
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case "Rejected":
                return "bg-red-100 text-red-800 border border-red-200";
            case "Cancelled":
                return "bg-red-100 text-red-800 border border-red-200";
            default:
                return "bg-muted text-muted-foreground border border-border";
        }
    };

    return (
        <>
            <div className="flex min-h-screen bg-background">
                <aside className="w-64 bg-card shadow-sm border-r border-border">
                    <div className="p-6">
                        <h2 className="text-foreground mb-6">Admin Panel</h2>

                        <nav className="space-y-2">
                            <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>

                            <Link
                                to="/admin/appointments"
                                className="flex items-center gap-3 px-4 py-3 bg-muted text-foreground rounded-lg"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Appointments</span>
                            </Link>

                            <Link
                                to="/admin/services"
                                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <Scissors className="w-5 h-5" />
                                <span>Services</span>
                            </Link>

                            <Link
                                to="/admin/barbers"
                                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <span>Barbers</span>
                            </Link>

                            <Link
                                to="/admin/users"
                                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <span>Users</span>
                            </Link>
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-foreground mb-2">Appointment Management</h1>
                        <p className="text-muted-foreground">Review and manage all appointments</p>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="search" className="block text-sm text-foreground mb-2">
                                    Search
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search customer or service..."
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="status-filter" className="block text-sm text-foreground mb-2">
                                    <Filter className="inline w-4 h-4 mr-1" />
                                    Status
                                </label>

                                <select
                                    id="status-filter"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="date-filter" className="block text-sm text-foreground mb-2">
                                    Date
                                </label>

                                <input
                                    id="date-filter"
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">ID</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Service</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Barber</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment.appointment_id} className="hover:bg-muted">
                                            <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                                #{appointment.appointment_id}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                                {appointment.customer}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {appointment.service}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {appointment.barber}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                <div>{normalizeDate(appointment.appt_date)}</div>
                                                <div className="text-sm text-muted-foreground">{appointment.appt_time}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                                ${appointment.price_at_booking}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={"inline-flex px-3 py-1 rounded-full text-sm " + getStatusColor(appointment.status)}>
                                                    {appointment.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {appointment.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(appointment.appointment_id)}
                                                                className="p-2 text-green-600 hover:bg-muted rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleReject(appointment.appointment_id)}
                                                                className="p-2 text-red-600 hover:bg-muted rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />


                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(appointment.appointment_id)}
                                                        className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {appointment.status === "Approved" && (
                                                        <button
                                                            onClick={() => handleComplete(appointment.appointment_id)}
                                                            className="px-3 py-1 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredAppointments.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No appointments found matching your filters.
                            </div>
                        )}
                    </div>
                </main>
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

export default AdminAppointments;
