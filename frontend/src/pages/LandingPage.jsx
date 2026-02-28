import { Link } from 'react-router'

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="relative overflow-hidden">
                <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.25em] text-cyan-300">CLINICFLOW</p>
                            <p className="mt-1 text-xs text-slate-300">Smart Clinic Management Platform</p>
                        </div>
                        <div className="hidden gap-3 sm:flex">
                            <Link to={'/login'} className="rounded-lg border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200">
                                Login
                            </Link>
                            <Link to={'/register'} className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
                                Get Started
                            </Link>
                        </div>
                    </header>

                    <section className="mt-14 grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                                Modern Clinic Operations,
                                <span className="block text-cyan-300">One Unified Dashboard.</span>
                            </h1>
                            <p className="mt-5 max-w-xl text-lg text-slate-300">
                                Manage doctors, reception staff, and patients with role-based access, streamlined workflows, and a clean admin experience.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link to={'/register'} className="rounded-xl bg-cyan-400 px-7 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
                                    Create Account
                                </Link>
                                <Link to={'/login'} className="rounded-xl border border-slate-500 px-7 py-3 font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200">
                                    Sign In
                                </Link>
                            </div>

                            <div className="mt-10 grid grid-cols-3 gap-4 text-left">
                                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                    <p className="text-2xl font-bold text-cyan-300">24/7</p>
                                    <p className="text-xs text-slate-300">Access Control</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                    <p className="text-2xl font-bold text-cyan-300">Role</p>
                                    <p className="text-xs text-slate-300">Based Routing</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                    <p className="text-2xl font-bold text-cyan-300">Fast</p>
                                    <p className="text-xs text-slate-300">CRUD Panels</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl">
                            <p className="text-sm font-semibold text-cyan-300">Platform Highlights</p>
                            <div className="mt-5 space-y-4">
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                    <p className="font-semibold">Doctor Management</p>
                                    <p className="mt-1 text-sm text-slate-300">Create, update, and track doctor profiles with license and specialization details.</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                    <p className="font-semibold">Reception Workflow</p>
                                    <p className="mt-1 text-sm text-slate-300">Manage receptionist records including hospital branch, location, and timings.</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                    <p className="font-semibold">Patient Registry</p>
                                    <p className="mt-1 text-sm text-slate-300">Store patient demographics, blood group, and disease context in one secure panel.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
