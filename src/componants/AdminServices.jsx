import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActionModal from "./ActionModal";
import { Calendar, Users, Scissors, TrendingUp, Trash2, PencilLine, Plus } from "lucide-react";

function AdminServices() {
    const baseUrl = import.meta.env.VITE_API_URL;


    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // form state
    const [serviceName, setServiceName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [durationMin, setDurationMin] = useState("");

    // edit state
    const [editingId, setEditingId] = useState(null);
    const isEditing = editingId !== null;

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

    const showConfirm = ({ title, message, confirmText, action }) => {
        setModal({
            open: true,
            title,
            message,
            confirmText,
            cancelText: "Cancel",
            danger: true,
            onConfirm: () => {
                action();
                closeModal();
            },
        });
    };

    const resetForm = () => {
        setServiceName("");
        setDescription("");
        setPrice("");
        setDurationMin("");
        setEditingId(null);
    };

    // Fetch services
    useEffect(() => {
        setLoading(true);

        fetch(`${baseUrl}/api/admin/services`, {
            headers: {
                "x-role": sessionStorage.getItem("role"),

            },
        })
            .then((res) => res.json())
            .then((data) => {
                setServices(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching services:", err);
                setServices([]);
                setLoading(false);
            });
    }, [baseUrl]);

    const startEdit = (service) => {
        setEditingId(service.service_id);
        setServiceName(service.name || "");
        setDescription(service.description || "");
        setPrice(String(service.price ?? ""));
        setDurationMin(String(service.duration_min ?? ""));
    };

    const handleDelete = (serviceId) => {
        showConfirm({
            title: "Delete Service",
            message: "Are you sure you want to delete this service? This action cannot be undone.",
            confirmText: "Delete",
            action: () => {
                fetch(`${baseUrl}/api/admin/services/${serviceId}`, {
                    method: "DELETE",
                    headers: {
                        "x-role": sessionStorage.getItem("role"),
                    },
                })
                    .then((res) => res.json())
                    .then(() => {
                        setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
                        if (editingId === serviceId) resetForm();
                        showInfo({ title: "Deleted", message: "Service deleted successfully." });
                    })
                    .catch((err) => {
                        console.error("Delete service error:", err);
                        showInfo({ title: "Error", message: "Failed to delete service." });
                    });
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanName = serviceName.trim();
        const cleanDesc = description.trim();
        const cleanPrice = Number(price);
        const cleanDurationMin = Number(durationMin);

        if (!cleanName || !price || !durationMin) {
            showInfo({
                title: "Missing Information",
                message: "Please fill Service name, Price, and Duration (minutes).",
            });
            return;
        }

        if (Number.isNaN(cleanPrice) || cleanPrice <= 0) {
            showInfo({ title: "Invalid Price", message: "Price must be a valid number greater than 0." });
            return;
        }

        if (Number.isNaN(cleanDurationMin) || cleanDurationMin <= 0) {
            showInfo({ title: "Invalid Duration", message: "Duration must be a valid number of minutes greater than 0." });
            return;
        }

        // UPDATE
        if (isEditing) {
            fetch(`${baseUrl}/api/admin/services/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-role": sessionStorage.getItem("role") },
                body: JSON.stringify({
                    name: cleanName,
                    description: cleanDesc || null,
                    price: cleanPrice,
                    duration_min: cleanDurationMin,
                    is_active: true,
                }),
            })
                .then((res) => res.json())
                .then((updated) => {
                    setServices((prev) =>
                        prev.map((s) => (s.service_id === editingId ? updated : s))
                    );
                    showInfo({ title: "Updated", message: "Service updated successfully." });
                    resetForm();
                })
                .catch((err) => {
                    console.error("Update service error:", err);
                    showInfo({ title: "Error", message: "Failed to update service." });
                });

            return;
        }

        // CREATE
        fetch(`${baseUrl}/api/admin/services`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-role": sessionStorage.getItem("role") },
            body: JSON.stringify({
                name: cleanName,
                description: cleanDesc || null,
                price: cleanPrice,
                duration_min: cleanDurationMin,
            }),
        })
            .then((res) => res.json())
            .then((created) => {
                setServices((prev) => [created, ...prev]);
                showInfo({ title: "Added", message: "Service added successfully." });
                resetForm();
            })
            .catch((err) => {
                console.error("Create service error:", err);
                showInfo({ title: "Error", message: "Failed to add service." });
            });
    };

    const sidebarItemClass = (toPath) => {
        const isActive = window.location.pathname === toPath;
        return (
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " +
            (isActive ? "bg-muted text-foreground" : "text-foreground hover:bg-muted")
        );
    };

    return (
        <>
            <div className="flex min-h-screen bg-background">
                {/* Sidebar */}
                <aside className="w-64 bg-card shadow-sm border-r border-border">
                    <div className="p-6">
                        <h2 className="text-foreground mb-6">Admin Panel</h2>

                        <nav className="space-y-2">
                            <Link to="/admin" className={sidebarItemClass("/admin")}>
                                <TrendingUp className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>

                            <Link to="/admin/appointments" className={sidebarItemClass("/admin/appointments")}>
                                <Calendar className="w-5 h-5" />
                                <span>Appointments</span>
                            </Link>

                            <Link to="/admin/services" className={sidebarItemClass("/admin/services")}>
                                <Scissors className="w-5 h-5" />
                                <span>Services</span>
                            </Link>

                            <Link to="/admin/barbers" className={sidebarItemClass("/admin/barbers")}>
                                <Users className="w-5 h-5" />
                                <span>Barbers</span>
                            </Link>

                            <Link to="/admin/users" className={sidebarItemClass("/admin/users")}>
                                <Users className="w-5 h-5" />
                                <span>Users</span>
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-foreground mb-2">Services</h1>
                        <p className="text-muted-foreground">Manage your service list (add, edit, delete)</p>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-8">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-foreground">Service List</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                            Service Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {loading && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                Loading services...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        services.map((s) => (
                                            <tr key={s.service_id} className="hover:bg-muted">
                                                <td className="px-6 py-4 text-foreground">{s.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">${s.price}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{s.duration_min} min</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(s)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                                                            title="Edit"
                                                        >
                                                            <PencilLine className="w-4 h-4" />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(s.service_id)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    {!loading && services.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                No services found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-foreground">{isEditing ? "Update Service" : "Add New Service"}</h2>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-foreground mb-2">Service name</label>
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="e.g. Haircut"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="optional"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Price</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 30"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Duration (min)</label>
                                <input
                                    type="number"
                                    value={durationMin}
                                    onChange={(e) => setDurationMin(e.target.value)}
                                    placeholder="e.g. 30"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isEditing ? "Update Service" : "Add New Service"}
                                </button>
                            </div>
                        </form>
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

export default AdminServices;
