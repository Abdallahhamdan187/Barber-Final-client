import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActionModal from "./ActionModal";
import { Calendar, Users, Scissors, TrendingUp, PencilLine, UserX, Plus } from "lucide-react";

function AdminBarbers() {
    const baseUrl = import.meta.env.VITE_API_URL;

    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [barberName, setBarberName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [phone, setPhone] = useState("");

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

    const sidebarItemClass = (toPath) => {
        const isActive = window.location.pathname === toPath;
        return (
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " +
            (isActive ? "bg-muted text-foreground" : "text-foreground hover:bg-muted")
        );
    };

    const resetForm = () => {
        setBarberName("");
        setSpecialization("");
        setWorkingHours("");
        setPhone("");
        setEditingId(null);
    };

    const fetchBarbers = () => {
        setLoading(true);

        fetch(`${baseUrl}/api/admin/barbers`, {
            headers: {
                "x-role": localStorage.getItem("role"),
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to fetch barbers");
                }
                return res.json();
            })
            .then((data) => {
                setBarbers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching barbers:", err);
                setBarbers([]);
                setLoading(false);
                showInfo({ title: "Error", message: err.message || "Failed to load barbers." });
            });
    };

    useEffect(() => {
        fetchBarbers();
    }, [baseUrl]);

    const startEdit = (b) => {
        setEditingId(b.barber_id);
        setBarberName(b.name || "");
        setSpecialization(b.specialization || "");
        setWorkingHours(b.working_hours || "");
        setPhone(b.phone ? String(b.phone) : "");
    };

    const handleRemove = (barberId) => {
        const barber = barbers.find((b) => b.barber_id === barberId);

        showConfirm({
            title: "Remove Barber",
            message: `Are you sure you want to remove ${barber?.name || "this barber"} from the system?`,
            confirmText: "Remove",
            action: () => {
                fetch(`${baseUrl}/api/admin/barbers/${barberId}`, {
                    method: "DELETE",
                    headers: {
                        "x-role": localStorage.getItem("role"),
                    },
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || "Failed to remove barber");
                        }
                        return res.json();
                    })
                    .then(() => {
                        if (editingId === barberId) resetForm();
                        fetchBarbers();
                        showInfo({ title: "Removed", message: "Barber removed successfully." });
                    })
                    .catch((err) => {
                        console.error("Remove barber error:", err);
                        showInfo({ title: "Error", message: err.message || "Failed to remove barber." });
                    });
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const name = barberName.trim();
        const spec = specialization.trim();
        const hours = workingHours.trim();
        const phoneNum = phone.trim();

        if (!name || !spec || !hours || !phoneNum) {
            showInfo({
                title: "Missing Information",
                message: "Please fill Barber name, Specialization, Working hours, and Phone number.",
            });
            return;
        }

        // UPDATE
        if (isEditing) {
            if (!editingId) {
                showInfo({ title: "Error", message: "Missing barber id. Please refresh the page." });
                return;
            }

            fetch(`${baseUrl}/api/admin/barbers/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-role": localStorage.getItem("role") },
                body: JSON.stringify({
                    name,
                    specialization: spec,
                    working_hours: hours,
                    phone: phoneNum,
                    is_active: true,
                }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || "Failed to update barber");
                    }
                    return res.json();
                })
                .then(() => {
                    fetchBarbers();
                    showInfo({ title: "Updated", message: "Barber updated successfully." });
                    resetForm();
                })
                .catch((err) => {
                    console.error("Update barber error:", err);
                    showInfo({ title: "Error", message: err.message || "Failed to update barber." });
                });

            return;
        }

        // CREATE
        fetch(`${baseUrl}/api/admin/barbers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-role": localStorage.getItem("role") },
            body: JSON.stringify({
                name,
                specialization: spec,
                working_hours: hours,
                phone: phoneNum,
            }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to add barber");
                }
                return res.json();
            })
            .then(() => {
                fetchBarbers();
                showInfo({ title: "Added", message: "Barber added successfully." });
                resetForm();
            })
            .catch((err) => {
                console.error("Create barber error:", err);
                showInfo({ title: "Error", message: err.message || "Failed to add barber." });
            });
    };

    return (
        <>
            <div className="flex min-h-screen bg-background">
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

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-foreground mb-2">Barbers Management</h1>
                        <p className="text-muted-foreground">Add, update, and remove barbers</p>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-8">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-foreground">Barbers List</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Barber Name</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Specialization</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Working Hours</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Phone</th>

                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {loading && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                Loading barbers...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        barbers.map((b) => (
                                            <tr key={b.barber_id} className="hover:bg-muted">
                                                <td className="px-6 py-4 text-foreground">{b.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{b.specialization}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{b.working_hours}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{b.phone}</td>


                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(b)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                                                            title="Edit"
                                                        >
                                                            <PencilLine className="w-4 h-4" />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(b.barber_id)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-red-600"
                                                            title="Remove"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    {!loading && barbers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                No barbers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-foreground">{isEditing ? "Update Barber" : "Add New Barber"}</h2>

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

                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-foreground mb-2">Barber Name</label>
                                <input
                                    type="text"
                                    value={barberName}
                                    onChange={(e) => setBarberName(e.target.value)}
                                    placeholder="e.g. Ahmad"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Specialization</label>
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    placeholder="e.g. Haircut"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Working Hours</label>
                                <input
                                    type="text"
                                    value={workingHours}
                                    onChange={(e) => setWorkingHours(e.target.value)}
                                    placeholder="e.g. 9am–5pm"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-foreground mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 079xxxxxxx"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isEditing ? "Update Barber" : "Add New Barber"}
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

export default AdminBarbers;
