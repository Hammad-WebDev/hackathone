import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Notification from "../components/Notification";
import { useState } from "react";
import Cookies from "js-cookie";
import { useLoadingBar } from "react-top-loading-bar";
import { getUserFromToken } from "../zustand/authStore";

const registerSchema = yup.object().shape({
  role: yup
    .string()
    .oneOf(["patient", "doctor", "receptionist"], "Please select a valid role")
    .required("Role is required"),
  name: yup
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),
  qualification: yup.string().when("role", {
    is: "doctor",
    then: (schema) => schema.trim().max(100, "Max 100 characters").required("Qualification is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  licenseNumber: yup.string().when("role", {
    is: "doctor",
    then: (schema) => schema.trim().max(50, "Max 50 characters").required("License number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  specialization: yup.string().when("role", {
    is: "doctor",
    then: (schema) => schema.trim().max(100, "Max 100 characters").required("Specialization is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  hospitalName: yup.string().when("role", {
    is: "receptionist",
    then: (schema) => schema.trim().max(100, "Max 100 characters").required("Hospital name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  location: yup.string().when("role", {
    is: "receptionist",
    then: (schema) => schema.trim().max(150, "Max 150 characters").required("Location is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  timings: yup.string().when("role", {
    is: "receptionist",
    then: (schema) => schema.trim().max(100, "Max 100 characters").required("Timings are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  age: yup.number().when("role", {
    is: "patient",
    then: (schema) =>
      schema
        .typeError("Age must be a number")
        .integer("Age must be a whole number")
        .min(0, "Age must be at least 0")
        .max(130, "Age must be at most 130")
        .required("Age is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  gender: yup.string().when("role", {
    is: "patient",
    then: (schema) => schema.oneOf(["male", "female", "other"], "Select valid gender").required("Gender is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  bloodGroup: yup.string().when("role", {
    is: "patient",
    then: (schema) =>
      schema
        .oneOf(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "Select valid blood group")
        .required("Blood group is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  disease: yup.string().when("role", {
    is: "patient",
    then: (schema) => schema.trim().max(200, "Max 200 characters").required("Disease is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: yup
    .string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be at most 50 characters")
    .required("Password is required"),
});

const RegisterPage = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { start, complete } = useLoadingBar({
    color: "red",
    height: 3,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "patient",
    },
  });

  const selectedRole = watch("role");

  const inputClass = (fieldName) =>
    `w-full mt-2 rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
      errors[fieldName]
        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  const handleRegister = async (data) => {
    try {
      setError(null);
      setSuccessMessage("");
      start();

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === "doctor"
          ? {
              qualification: data.qualification,
              licenseNumber: data.licenseNumber,
              specialization: data.specialization,
            }
          : {}),
        ...(data.role === "receptionist"
          ? {
              hospitalName: data.hospitalName,
              location: data.location,
              timings: data.timings,
            }
          : {}),
        ...(data.role === "patient"
          ? {
              age: Number(data.age),
              gender: data.gender,
              bloodGroup: data.bloodGroup,
              disease: data.disease,
            }
          : {}),
      };

      const res = await axios.post("http://localhost:3000/auth/register", payload);
      const token = res?.data?.user?.token || res?.data?.token;
      Cookies.set("token", token, { expires: 1 / 24 });
      await getUserFromToken();
      setSuccessMessage("Registration successful.");
      complete();
    } catch (apiError) {
      const isNetworkError = !apiError?.response || apiError?.code === "ERR_NETWORK";
      setError(
        isNetworkError
          ? "check your network connection"
          : apiError.response?.data?.message || "Registration failed"
      );
      complete();
    }
  };

  return (
    <>
      <div className="error">
        <Notification error={error} />
      </div>
      <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl lg:grid-cols-2">
          <section className="relative hidden overflow-hidden p-10 text-white lg:block">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500 via-blue-500 to-indigo-600 opacity-90" />
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-slate-950/30 blur-2xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/80">Care Portal</p>
                <h1 className="mt-6 text-4xl font-black leading-tight">Create Your Account</h1>
                <p className="mt-4 max-w-sm text-white/90">
                  Select your role and submit the required details to continue.
                </p>
              </div>
              <p className="text-sm text-white/80">Role based onboarding enabled.</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-10 lg:p-12">
            <h2 className="text-3xl font-bold text-slate-900">Register</h2>
            <p className="mt-2 text-sm text-slate-500">Create patient, doctor or receptionist account.</p>

            {successMessage && (
              <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(handleRegister)} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <select {...register("role")} className={inputClass("role")}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                </select>
                {errors.role && <span className="mt-1 block text-sm text-rose-600">{errors.role.message}</span>}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {selectedRole === "doctor" ? "Doctor Name" : "Name"}
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder={selectedRole === "doctor" ? "Dr. Ahmed" : "Your name"}
                  className={inputClass("name")}
                />
                {errors.name && <span className="mt-1 block text-sm text-rose-600">{errors.name.message}</span>}
              </div>

              {selectedRole === "doctor" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Qualification</label>
                    <input
                      {...register("qualification")}
                      type="text"
                      placeholder="MBBS, FCPS"
                      className={inputClass("qualification")}
                    />
                    {errors.qualification && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.qualification.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">License Number</label>
                    <input
                      {...register("licenseNumber")}
                      type="text"
                      placeholder="LIC-12345"
                      className={inputClass("licenseNumber")}
                    />
                    {errors.licenseNumber && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.licenseNumber.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Specialization</label>
                    <input
                      {...register("specialization")}
                      type="text"
                      placeholder="Cardiology"
                      className={inputClass("specialization")}
                    />
                    {errors.specialization && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.specialization.message}</span>
                    )}
                  </div>
                </>
              )}

              {selectedRole === "receptionist" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Hospital Name</label>
                    <input
                      {...register("hospitalName")}
                      type="text"
                      placeholder="City Hospital"
                      className={inputClass("hospitalName")}
                    />
                    {errors.hospitalName && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.hospitalName.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Location</label>
                    <input
                      {...register("location")}
                      type="text"
                      placeholder="Lahore"
                      className={inputClass("location")}
                    />
                    {errors.location && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.location.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Timings</label>
                    <input
                      {...register("timings")}
                      type="text"
                      placeholder="Mon-Sat 9am-5pm"
                      className={inputClass("timings")}
                    />
                    {errors.timings && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.timings.message}</span>
                    )}
                  </div>
                </>
              )}

              {selectedRole === "patient" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Age</label>
                    <input
                      {...register("age")}
                      type="number"
                      min="0"
                      max="130"
                      placeholder="Enter age"
                      className={inputClass("age")}
                    />
                    {errors.age && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.age.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Gender</label>
                    <select {...register("gender")} className={inputClass("gender")}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.gender.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Blood Group</label>
                    <select {...register("bloodGroup")} className={inputClass("bloodGroup")}>
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.bloodGroup.message}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Disease</label>
                    <input
                      {...register("disease")}
                      type="text"
                      placeholder="Describe disease"
                      className={inputClass("disease")}
                    />
                    {errors.disease && (
                      <span className="mt-1 block text-sm text-rose-600">{errors.disease.message}</span>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass("email")}
                />
                {errors.email && <span className="mt-1 block text-sm text-rose-600">{errors.email.message}</span>}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Create password"
                  className={inputClass("password")}
                />
                {errors.password && (
                  <span className="mt-1 block text-sm text-rose-600">{errors.password.message}</span>
                )}
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className={`mt-2 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                Register
              </button>

              <p className="pt-2 text-center text-sm text-slate-600">
                Already have an account?
                <Link to="/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
                  Login
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
