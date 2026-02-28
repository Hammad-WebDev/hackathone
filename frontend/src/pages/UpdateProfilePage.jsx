import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { MdArrowBack } from "react-icons/md";
import * as yup from "yup";
import useAuthStore, { getUserFromToken } from "../zustand/authStore";
import { useLoadingBar } from "react-top-loading-bar";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateProfilePage = () => {
    const authUser = useAuthStore(state => state.user);
    const token = Cookies.get('token');
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const { start, complete } = useLoadingBar({
        color: "red",
        height: 3,
    });

    const updateProfileSchema = yup.object().shape({
        username: yup
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be at most 20 characters')
            .required('Username is required'),
        email: yup
            .string()
            .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
            .required('Email is required'),
        password: yup
            .string()
            .transform((value) => (value ? value : ''))
            .test('len', 'Password must be at least 6 characters', (value) => !value || value.length >= 6)
            .test('max', 'Password must be at most 50 characters', (value) => !value || value.length <= 50),
    });


    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(updateProfileSchema),
        defaultValues: {
            username: authUser?.name || '',
            email: authUser?.email || '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            setError(null);
            setSuccessMessage("");
            start();
            const payload = {
                name: data.username,
                email: data.email,
                ...(data.password ? { password: data.password } : {}),
            };

            let res = await axios.put(`https://hackathone-fc6b.vercel.app/auth/users/${authUser?._id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Cookies.set('token', res?.data?.token, { expires: 1 / 24 }); // 1 hour expiry
            await getUserFromToken();
            setSuccessMessage("Profile updated successfully.");
            complete();
        } catch (error) {
            console.log(error);
            const isNetworkError = !error?.response || error?.code === 'ERR_NETWORK';
            setError(isNetworkError ? "check your network connection" : (error.response?.data?.message || "Profile update failed"));
            complete();
        }
    };

    const inputClass = (field) =>
        `w-full mt-2 rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4
     ${errors[field] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}`;

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl lg:grid-cols-2">
                <section className="relative hidden overflow-hidden p-10 text-white lg:block">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500 via-sky-500 to-cyan-400 opacity-90" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
                    <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-slate-950/30 blur-2xl" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-white/80">Profile Center</p>
                            <h1 className="mt-6 text-4xl font-black leading-tight">Keep Your Account Updated</h1>
                            <p className="mt-4 max-w-sm text-white/90">
                                Update your personal details and security credentials to keep your clinic account safe.
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-4">
                            <p className="text-sm text-white/85">Current Role</p>
                            <p className="mt-1 text-xl font-bold capitalize">{authUser?.role || "user"}</p>
                        </div>
                    </div>
                </section>

                <section className="relative bg-white p-6 sm:p-10 lg:p-12">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        className="absolute left-6 top-6 rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 cursor-pointer"
                    >
                        <MdArrowBack className="text-xl" />
                    </button>

                    <h2 className="pt-10 text-3xl font-bold text-slate-900">Update Profile</h2>
                    <p className="mt-2 text-sm text-slate-500">Edit your details below and save changes.</p>

                    {error && (
                        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Username</label>
                            <input
                                {...register("username")}
                                type="text"
                                placeholder="Enter username"
                                className={inputClass("username")}
                            />
                            {errors.username && <p className="mt-1 text-sm text-rose-600">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Enter email"
                                className={inputClass("email")}
                            />
                            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">New Password (optional)</label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="Leave blank to keep current password"
                                className={inputClass("password")}
                            />
                            {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className={`mt-2 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            Save Changes
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default UpdateProfilePage;
