import { useEffect, useMemo, useState } from "react";//-=-------------------------->
import { Link } from "react-router-dom";
import ActionModal from "./ActionModal";
import { Calendar, Users, Scissors, TrendingUp, Search, Trash2 } from "lucide-react";

function AdminUsers() {
    const baseUrl = import.meta.env.VITE_API_URL;

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

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

    const sidebarItemClass = (toPath) => {
        const isActive = window.location.pathname === toPath;
        return (
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " +
            (isActive ? "bg-muted text-foreground" : "text-foreground hover:bg-muted")
        );
    };

    const isAdminRole = (role) => String(role || "").toLowerCase() === "admin";

    useEffect(() => {
        setLoading(true);
        try {
            fetch(`${baseUrl}/api/admin/users`, {
                headers: {
                    "x-role": localStorage.getItem("role"),
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const list = Array.isArray(data) ? data : [];

                    // DO NOT show admin accounts in the table
                    const withoutAdmins = list.filter((u) => !isAdminRole(u.role));

                    setUsersList(withoutAdmins);
                    setLoading(false);
                })

        } catch (error) {
            console.error("Fetch users error:", error);
            setLoading(false);
        }
    }, [baseUrl]);

    const clearFilters = () => {
        setSearchTerm("");
        setRoleFilter("All");
    };

    const filteredUsers = useMemo(() => {//--------------------------->
        const term = searchTerm.trim().toLowerCase();

        return usersList.filter((u) => {
            const name = String(u.full_name ?? u.name ?? "").toLowerCase();
            const email = String(u.email ?? "").toLowerCase();
            const role = String(u.role ?? "");

            const matchesSearch = !term || name.includes(term) || email.includes(term);
            const matchesRole = roleFilter === "All" || role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [usersList, searchTerm, roleFilter]);

    const getUserId = (u) => u.user_id ?? u.id;

    const handleDelete = (id) => {
        const user = usersList.find((u) => getUserId(u) === id);
        if (!user) return;

        // extra safety: never delete admin even if it somehow appears
        if (isAdminRole(user.role)) {
            showInfo({ title: "Not Allowed", message: "You cannot delete an Admin account." });
            return;
        }

        showConfirm({
            title: "Delete User",
            message: `Delete user account for ${user.full_name ?? user.name ?? "this user"}? This action cannot be undone.`,
            confirmText: "Delete",
            danger: true,
            action: () => {
                try {
                    fetch(`${baseUrl}/api/admin/users/${id}`, {
                        method: "DELETE",
                        headers: {
                            "x-role": localStorage.getItem("role"),
                        },
                    })
                        .then((res) => {
                            if (!res.ok) throw new Error("Delete failed");
                            return res.json();
                        })
                        .then(() => {
                            setUsersList((prev) => prev.filter((u) => getUserId(u) !== id));
                            showInfo({ title: "Deleted", message: "User deleted successfully." });
                        })
                } catch (error) {
                    console.error("Delete user error:", error);
                    showInfo({ title: "Error", message: "Failed to delete user." });
                }
            }
        });
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
                        <h1 className="text-foreground mb-2">Users Management</h1>
                        <p className="text-muted-foreground">Search, and manage user accounts</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-foreground mb-2">Search</label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search name or email..."
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>



                            <div className="flex items-end gap-210">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                                >
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {filteredUsers.map((u) => {
                                                const id = getUserId(u);

                                                return (
                                                    <tr key={id} className="hover:bg-muted">
                                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                                            {u.full_name ?? u.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{u.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{u.role}</td>

                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(id)}
                                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
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

export default AdminUsers;
