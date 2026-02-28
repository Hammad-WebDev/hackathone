import { Link, useNavigate } from "react-router";
import useAuthStore from "../zustand/authStore";
import Cookies from "js-cookie";

const DashboardPage = () => {
    const navigate = useNavigate();
    const authUser = useAuthStore(state => state.user);
    const role = authUser?.role || "user";

    const roleConfig = {
        doctor: {
            title: "Doctor Workspace",
            subtitle: "Track appointments, monitor patient load, and follow your daily schedule.",
            stats: [
                { label: "Today's Appointments", value: "12", tone: "text-cyan-300" },
                { label: "Pending Reports", value: "5", tone: "text-amber-300" },
                { label: "Follow-up Cases", value: "8", tone: "text-emerald-300" },
            ],
            feedTitle: "Appointment Queue",
            feedItems: [
                "09:00 AM - Ahmed Raza (Cardiology checkup)",
                "10:30 AM - Sara Malik (Follow-up consultation)",
                "12:00 PM - Hina Noor (Blood pressure review)",
                "02:00 PM - Usman Ali (ECG discussion)",
            ],
        },
        receptionist: {
            title: "Reception Desk",
            subtitle: "Manage incoming patients, schedules, and front desk operations.",
            stats: [
                { label: "Check-ins Today", value: "34", tone: "text-cyan-300" },
                { label: "Tokens Issued", value: "27", tone: "text-amber-300" },
                { label: "Billing Pending", value: "6", tone: "text-emerald-300" },
            ],
            feedTitle: "Front Desk Tasks",
            feedItems: [
                "Verify patient file for token #41",
                "Call next patient for Dr. Hamza",
                "Update evening shift appointment sheet",
                "Confirm insurance details for 3 new patients",
            ],
        },
        patient: {
            title: "Patient Dashboard",
            subtitle: "View your appointments, medical notes, and recommended follow-ups.",
            stats: [
                { label: "Next Appointment", value: "2 Days", tone: "text-cyan-300" },
                { label: "Active Prescriptions", value: "3", tone: "text-amber-300" },
                { label: "Lab Reports Ready", value: "1", tone: "text-emerald-300" },
            ],
            feedTitle: "Health Timeline",
            feedItems: [
                "Cardiology visit completed on 12 Feb",
                "Blood report uploaded on 15 Feb",
                "Medication updated for next 14 days",
                "Follow-up visit recommended next week",
            ],
        },
        user: {
            title: "User Dashboard",
            subtitle: "Quick access to your profile, activity, and clinic services.",
            stats: [
                { label: "Recent Activity", value: "9", tone: "text-cyan-300" },
                { label: "Notifications", value: "4", tone: "text-amber-300" },
                { label: "Saved Records", value: "11", tone: "text-emerald-300" },
            ],
            feedTitle: "Recent Updates",
            feedItems: [
                "Profile details verified",
                "New clinic service added",
                "Reminder set for next visit",
                "Support message replied",
            ],
        },
    };

    const current = roleConfig[role] || roleConfig.user;

    const handleLogout = () => {
        Cookies.remove('token');
        useAuthStore.setState({ user: null, token: null });
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">
                <aside className="w-72 border-r border-slate-800 bg-slate-900/80 p-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">ClinicFlow</p>
                    <h2 className="mt-3 text-2xl font-bold">Dashboard</h2>
                    <p className="mt-2 text-sm text-slate-400">Signed in as {authUser?.name}</p>
                    <p className="text-xs uppercase tracking-wide text-emerald-300 mt-1">role: {role}</p>

                    <div className="mt-8 space-y-2">
                        <Link to={'/dashboard/ai'} className="block rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200">
                            AI Assistant
                        </Link>
                        <Link to={'/dashboard/updateprofile'} className="block rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200">
                            Update Profile
                        </Link>
                        <button type="button" className="w-full rounded-lg border border-slate-700 px-4 py-2 text-left font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200 cursor-pointer">
                            Notifications
                        </button>
                    </div>

                    <button onClick={handleLogout} className="mt-10 w-full rounded-lg bg-rose-600 px-4 py-2 font-semibold hover:bg-rose-700 cursor-pointer">
                        Logout
                    </button>
                </aside>

                <main className="flex-1 p-6 sm:p-10">
                    <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
                        <p className="text-sm text-cyan-300">Welcome back</p>
                        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{current.title}</h1>
                        <p className="mt-3 max-w-2xl text-slate-300">{current.subtitle}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {current.stats.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-sm text-slate-400">{item.label}</p>
                                <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
                        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <h3 className="text-xl font-bold">{current.feedTitle}</h3>
                            <div className="mt-4 space-y-3">
                                {current.feedItems.map((item, idx) => (
                                    <div key={idx} className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-3 text-sm text-slate-200">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <h3 className="text-xl font-bold">Quick Actions</h3>
                            <div className="mt-4 space-y-3">
                                <button type="button" className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-left font-semibold text-slate-950 hover:bg-cyan-300 cursor-pointer">
                                    View Today's Schedule
                                </button>
                                <button type="button" className="w-full rounded-xl bg-slate-800 px-4 py-3 text-left font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer">
                                    Open Profile Settings
                                </button>
                                <button type="button" className="w-full rounded-xl bg-slate-800 px-4 py-3 text-left font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer">
                                    Contact Support
                                </button>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
