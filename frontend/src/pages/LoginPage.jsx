import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import Cookies from 'js-cookie'
import useAuthStore, { getUserFromToken } from '../zustand/authStore'
import { useLoadingBar } from "react-top-loading-bar";
import { http, showSuccess } from '../utility';

const LoginPage = () => {
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);

    const { start, complete } = useLoadingBar({
        color: "red",
        height: 3,
    });

    // LOGIN SCHEMA
    const loginSchema = yup.object().shape({
        email: yup
            .string()
            .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
            .required("Email is required"),

        password: yup
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(10, "Password must be at most 10 characters")
            .required("Password is required"),
    })

    // useForm
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting } } = useForm({
            resolver: yupResolver(loginSchema)
        })


    // HANDLE LOGIN
    const handleLogin = async (data) => {
        try {
            start();
            const response = await http.post("/auth/login", {
                email: data.email,
                password: data.password,
            });
            const token = response?.data?.user?.token || response?.data?.token;
            if (!token) {
                throw new Error("Token not found in login response");
            }
            Cookies.set('token', token, { expires: 1 / 24 }); // 1 hour expiry
            setToken(token);
            await getUserFromToken();
            showSuccess("Login successful! Welcome!");
            navigate('/dashboard');
            complete();
        } catch (error) {
            console.error("Login error:", error);
            complete();
        }
    }

    const inputClass = (field) =>
        `w-full mt-2 rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4
        ${errors[field] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}`

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl lg:grid-cols-2">
                <section className="relative hidden overflow-hidden p-10 text-white lg:block">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500 via-sky-500 to-cyan-400 opacity-90" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
                    <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-slate-950/30 blur-2xl" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-white/80">Care Portal</p>
                            <h1 className="mt-6 text-4xl font-black leading-tight">Welcome Back</h1>
                            <p className="mt-4 max-w-sm text-white/90">
                                Sign in to continue to your secure workspace and manage your daily operations.
                            </p>
                        </div>
                        <p className="text-sm text-white/80">Fast. Secure. Role-Based Access.</p>
                    </div>
                </section>

                <section className="bg-white p-6 sm:p-10 lg:p-12">
                    <h2 className="text-3xl font-bold text-slate-900">Login</h2>
                    <p className="mt-2 text-sm text-slate-500">Use your email and password to access dashboard.</p>

                    <form onSubmit={handleSubmit(handleLogin)} className="mt-8 space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                className={inputClass("email")}
                            />
                            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="Enter your password"
                                className={inputClass("password")}
                            />
                            {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className={`mt-2 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                            Login
                        </button>

                        <p className="pt-2 text-center text-sm text-slate-600">
                            Not registered yet?
                            <Link to="/register" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">Create account</Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    )
}

export default LoginPage
