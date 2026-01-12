import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Calendar,
    Users,
    Scissors,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
} from "lucide-react";


const formatDate = (d) => {
    if (!d) return "";
    return String(d).split("T")[0];
};

function AdminDashboard() {
    const baseUrl = import.meta.env.VITE_API_URL;


    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingCount: 0,
        todayCount: 0,
        activeUsers: 0,
        activeBarbers: 0,
    });

    const [pendingAppointments, setPendingAppointments] = useState([]);


    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];

        fetch(`${baseUrl}/api/admin/dashboard/stats`, {
            headers: {
                "x-role": localStorage.getItem("role"),
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setStats((prev) => ({
                    ...prev,
                    activeUsers: data.activeusers ?? 0,
                    activeBarbers: data.activebarbers ?? 0,
                }));
            })
            .catch(console.error);

        // all appointments (compute everything from here)
        fetch(`${baseUrl}/api/admin/appointments`, {
            headers: {
                "x-role": localStorage.getItem("role"),
            },
        })
            .then((res) => res.json())
            .then((data) => {

                const list = Array.isArray(data) ? data : [];

                const pending = list.filter((a) => a.status === "Pending");
                const todayAppointments = list.filter((a) => formatDate(a.appt_date) === today);

                setStats((prev) => ({
                    ...prev,
                    totalAppointments: list.length,
                    pendingCount: pending.length,
                    todayCount: todayAppointments.length,
                }));

                setPendingAppointments(pending);
            })
            .catch(console.error);
    }, [baseUrl]);

    const getStatusIcon = (status) => {
        if (status === "Approved") return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (status === "Pending") return <Clock className="w-5 h-5 text-yellow-500" />;
        if (status === "Cancelled" || status === "Rejected") return <XCircle className="w-5 h-5 text-red-500" />;
        if (status === "Completed") return <CheckCircle className="w-5 h-5 text-blue-500" />;
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 bg-card shadow-sm border-r border-border">
                <div className="p-6">
                    <h2 className="text-foreground mb-6">Admin Panel</h2>

                    <nav className="space-y-2">
                        <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 bg-muted text-foreground rounded-lg"
                        >
                            <TrendingUp className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            to="/admin/appointments"
                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
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
                    <h1 className="text-foreground mb-2">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Welcome to the admin panel</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: "Total Appointments",
                            value: String(stats.totalAppointments),
                            change: `${stats.pendingCount} pending`,
                            icon: Calendar,
                            color: "text-blue-600",
                            bgColor: "bg-blue-100",
                        },
                        {
                            title: "Today's Appointments",
                            value: String(stats.todayCount),
                            change: "",
                            icon: Clock,
                            color: "text-amber-600",
                            bgColor: "bg-amber-100",
                        },
                        {
                            title: "Active Users",
                            value: String(stats.activeUsers),
                            change: "",
                            trend: "neutral",
                            icon: Users,
                            color: "text-green-600",
                            bgColor: "bg-green-100",
                        },
                        {
                            title: "Active Barbers",
                            value: String(stats.activeBarbers),
                            change: "",
                            trend: "neutral",
                            icon: Scissors,
                            color: "text-purple-600",
                            bgColor: "bg-purple-100",
                        },
                    ].map((stat, index) => (
                        <div key={index} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className={"w-12 h-12 " + stat.bgColor + " rounded-xl flex items-center justify-center"}>
                                    <stat.icon className={"w-6 h-6 " + stat.color} />
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm mb-1">{stat.title}</p>
                            <p className="text-foreground">{stat.value}</p>

                            {stat.change ? (
                                <p className="text-muted-foreground text-sm mt-1">{stat.change}</p>
                            ) : null}
                        </div>
                    ))}

                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-foreground">Pending Appointments</h2>

                        <Link to="/admin/appointments" className="text-foreground hover:opacity-80 text-sm">
                            View All
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        Service
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {pendingAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                            No pending appointments
                                        </td>
                                    </tr>
                                ) : (
                                    pendingAppointments.slice(0, 5).map((appointment) => (
                                        <tr key={appointment.appointment_id} className="hover:bg-muted">
                                            <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                                {appointment.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {appointment.service}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {appointment.appt_time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(appointment.status)}
                                                    <span className="text-muted-foreground">{appointment.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </main>
        </div>
    );
}

export default AdminDashboard;
