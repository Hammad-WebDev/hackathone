import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";
import useAuthStore from "../zustand/authStore";

const ENTITY = {
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
};

const emptyDoctorForm = {
  name: "",
  qualification: "",
  licenseNumber: "",
  specialization: "",
};

const emptyReceptionistForm = {
  name: "",
  hospitalName: "",
  location: "",
  timings: "",
};

const emptyPatientForm = {
  name: "",
  age: "",
  gender: "",
  bloodGroup: "",
  disease: "",
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const token = Cookies.get("token");

  const [activeEntity, setActiveEntity] = useState(ENTITY.DOCTOR);
  const [doctors, setDoctors] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(emptyDoctorForm);
  const [counts, setCounts] = useState({
    doctors: 0,
    receptionists: 0,
    patients: 0,
  });

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  const currentList =
    activeEntity === ENTITY.DOCTOR
      ? doctors
      : activeEntity === ENTITY.RECEPTIONIST
      ? receptionists
      : patients;
  const selectedItem = currentList.find((item) => item._id === selectedItemId) || null;
  const totalDoctors = counts.doctors;
  const totalReceptionists = counts.receptionists;
  const totalPatients = counts.patients;

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const getEmptyFormByEntity = (entity) =>
    entity === ENTITY.DOCTOR
      ? emptyDoctorForm
      : entity === ENTITY.RECEPTIONIST
      ? emptyReceptionistForm
      : emptyPatientForm;

  const getEntityLabel = () =>
    activeEntity === ENTITY.DOCTOR
      ? "Doctor"
      : activeEntity === ENTITY.RECEPTIONIST
      ? "Receptionist"
      : "Patient";

  const fetchDoctors = async () => {
    const res = await axios.get("https://hackathone-fc6b.vercel.app/doctors/get-all-doctors", authHeaders);
    setDoctors(res?.data?.doctors || []);
  };

  const fetchReceptionists = async () => {
    const res = await axios.get(
      "https://hackathone-fc6b.vercel.app/receptionists/get-all-receptionists",
      authHeaders
    );
    setReceptionists(res?.data?.receptionists || []);
  };

  const fetchPatients = async () => {
    const res = await axios.get("https://hackathone-fc6b.vercel.app/patients/get-all-patients", authHeaders);
    setPatients(res?.data?.patients || []);
  };

  const fetchCounts = async () => {
    try {
      setLoadingCounts(true);
      const res = await axios.get("https://hackathone-fc6b.vercel.app/stats/get-counts", authHeaders);
      const data = res?.data?.counts || {};
      setCounts({
        doctors: Number(data.doctors || 0),
        receptionists: Number(data.receptionists || 0),
        patients: Number(data.patients || 0),
      });
    } catch {
      setCounts({
        doctors: doctors.length,
        receptionists: receptionists.length,
        patients: patients.length,
      });
    } finally {
      setLoadingCounts(false);
    }
  };

  const fetchActiveList = async () => {
    try {
      setLoadingList(true);
      clearMessages();
      if (activeEntity === ENTITY.DOCTOR) {
        await fetchDoctors();
      } else if (activeEntity === ENTITY.RECEPTIONIST) {
        await fetchReceptionists();
      } else {
        await fetchPatients();
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || `Failed to fetch ${getEntityLabel().toLowerCase()}s`);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchActiveList();
  }, [activeEntity]);

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    if (currentList.length === 0) {
      setSelectedItemId(null);
      return;
    }
    setSelectedItemId((prev) => (currentList.some((item) => item._id === prev) ? prev : currentList[0]._id));
  }, [doctors, receptionists, patients, activeEntity]);

  useEffect(() => {
    if (selectedItem && isEditMode) {
      if (activeEntity === ENTITY.DOCTOR) {
        setFormData({
          name: selectedItem.name || "",
          qualification: selectedItem.qualification || "",
          licenseNumber: selectedItem.licenseNumber || "",
          specialization: selectedItem.specialization || "",
        });
      } else if (activeEntity === ENTITY.RECEPTIONIST) {
        setFormData({
          name: selectedItem.name || "",
          hospitalName: selectedItem.hospitalName || "",
          location: selectedItem.location || "",
          timings: selectedItem.timings || "",
        });
      } else {
        setFormData({
          name: selectedItem.name || "",
          age: selectedItem.age ?? "",
          gender: selectedItem.gender || "",
          bloodGroup: selectedItem.bloodGroup || "",
          disease: selectedItem.disease || "",
        });
      }
    }
  }, [selectedItemId, isEditMode, activeEntity]);

  const handleLogout = () => {
    Cookies.remove("token");
    useAuthStore.setState({ user: null, token: null });
    navigate("/");
  };

  const switchEntity = (entity) => {
    clearMessages();
    setActiveEntity(entity);
    setIsEditMode(false);
    setSelectedItemId(null);
    setFormData(getEmptyFormByEntity(entity));
  };

  const startCreateMode = () => {
    clearMessages();
    setIsEditMode(false);
    setSelectedItemId(null);
    setFormData(getEmptyFormByEntity(activeEntity));
  };

  const startEditMode = () => {
    if (!selectedItem) return;
    clearMessages();
    setIsEditMode(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCreateUrl = () =>
    activeEntity === ENTITY.DOCTOR
      ? "https://hackathone-fc6b.vercel.app/doctors/create-doctor"
      : activeEntity === ENTITY.RECEPTIONIST
      ? "https://hackathone-fc6b.vercel.app/receptionists/create-receptionist"
      : "https://hackathone-fc6b.vercel.app/patients/create-patient";

  const getUpdateUrl = (id) =>
    activeEntity === ENTITY.DOCTOR
      ? `https://hackathone-fc6b.vercel.app/doctors/update-doctor/${id}`
      : activeEntity === ENTITY.RECEPTIONIST
      ? `https://hackathone-fc6b.vercel.app/receptionists/update-receptionist/${id}`
      : `https://hackathone-fc6b.vercel.app/patients/update-patient/${id}`;

  const getDeleteUrl = (id) =>
    activeEntity === ENTITY.DOCTOR
      ? `https://hackathone-fc6b.vercel.app/doctors/delete-doctor/${id}`
      : activeEntity === ENTITY.RECEPTIONIST
      ? `https://hackathone-fc6b.vercel.app/receptionists/delete-receptionist/${id}`
      : `https://hackathone-fc6b.vercel.app/patients/delete-patient/${id}`;

  const buildPayload = () => {
    if (activeEntity === ENTITY.DOCTOR) {
      return {
        name: formData.name.trim(),
        qualification: formData.qualification.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        specialization: formData.specialization.trim(),
      };
    }
    if (activeEntity === ENTITY.RECEPTIONIST) {
      return {
        name: formData.name.trim(),
        hospitalName: formData.hospitalName.trim(),
        location: formData.location.trim(),
        timings: formData.timings.trim(),
      };
    }
    return {
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender.trim(),
      bloodGroup: formData.bloodGroup.trim(),
      disease: formData.disease.trim(),
    };
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      clearMessages();
      await axios.post(getCreateUrl(), buildPayload(), authHeaders);
      setSuccessMessage(`${getEntityLabel()} created successfully.`);
      setFormData(getEmptyFormByEntity(activeEntity));
      await fetchActiveList();
      await fetchCounts();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || `Failed to create ${getEntityLabel().toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selectedItem) return;
    try {
      setIsSaving(true);
      clearMessages();
      await axios.put(getUpdateUrl(selectedItem._id), buildPayload(), authHeaders);
      setSuccessMessage(`${getEntityLabel()} updated successfully.`);
      setIsEditMode(false);
      await fetchActiveList();
      await fetchCounts();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || `Failed to update ${getEntityLabel().toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    const shouldDelete = window.confirm(`Delete ${selectedItem.name}?`);
    if (!shouldDelete) return;

    try {
      setIsSaving(true);
      clearMessages();
      await axios.delete(getDeleteUrl(selectedItem._id), authHeaders);
      setSuccessMessage(`${getEntityLabel()} deleted successfully.`);
      setIsEditMode(false);
      setFormData(getEmptyFormByEntity(activeEntity));
      await fetchActiveList();
      await fetchCounts();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || `Failed to delete ${getEntityLabel().toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderListItem = (item) => {
    if (activeEntity === ENTITY.DOCTOR) {
      return (
        <>
          <p className="font-semibold text-slate-100">{item.name}</p>
          <p className="text-sm text-slate-300">{item.specialization}</p>
          <p className="text-xs text-slate-400 mt-1">License: {item.licenseNumber}</p>
        </>
      );
    }
    if (activeEntity === ENTITY.RECEPTIONIST) {
      return (
        <>
          <p className="font-semibold text-slate-100">{item.name}</p>
          <p className="text-sm text-slate-300">{item.hospitalName}</p>
          <p className="text-xs text-slate-400 mt-1">{item.location}</p>
        </>
      );
    }
    return (
      <>
        <p className="font-semibold text-slate-100">{item.name}</p>
        <p className="text-sm text-slate-300">Blood Group: {item.bloodGroup}</p>
        <p className="text-xs text-slate-400 mt-1">Age: {item.age}</p>
      </>
    );
  };

  const renderDetails = () => {
    if (!selectedItem) return null;
    if (activeEntity === ENTITY.DOCTOR) {
      return (
        <div className="space-y-2 text-slate-200">
          <p><span className="font-semibold">Name:</span> {selectedItem.name}</p>
          <p><span className="font-semibold">Qualification:</span> {selectedItem.qualification}</p>
          <p><span className="font-semibold">License Number:</span> {selectedItem.licenseNumber}</p>
          <p><span className="font-semibold">Specialization:</span> {selectedItem.specialization}</p>
        </div>
      );
    }
    if (activeEntity === ENTITY.RECEPTIONIST) {
      return (
        <div className="space-y-2 text-slate-200">
          <p><span className="font-semibold">Name:</span> {selectedItem.name}</p>
          <p><span className="font-semibold">Hospital Name:</span> {selectedItem.hospitalName}</p>
          <p><span className="font-semibold">Location:</span> {selectedItem.location}</p>
          <p><span className="font-semibold">Timings:</span> {selectedItem.timings}</p>
        </div>
      );
    }
    return (
      <div className="space-y-2 text-slate-200">
        <p><span className="font-semibold">Name:</span> {selectedItem.name}</p>
        <p><span className="font-semibold">Age:</span> {selectedItem.age}</p>
        <p><span className="font-semibold">Gender:</span> {selectedItem.gender}</p>
        <p><span className="font-semibold">Blood Group:</span> {selectedItem.bloodGroup}</p>
        <p><span className="font-semibold">Disease:</span> {selectedItem.disease}</p>
      </div>
    );
  };

  const renderFormFields = () => {
    if (activeEntity === ENTITY.DOCTOR) {
      return (
        <>
          <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Doctor name" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="qualification" value={formData.qualification} onChange={handleFormChange} placeholder="Qualification" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="licenseNumber" value={formData.licenseNumber} onChange={handleFormChange} placeholder="License number" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="specialization" value={formData.specialization} onChange={handleFormChange} placeholder="Specialization" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
        </>
      );
    }
    if (activeEntity === ENTITY.RECEPTIONIST) {
      return (
        <>
          <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Receptionist name" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="hospitalName" value={formData.hospitalName} onChange={handleFormChange} placeholder="Hospital name" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="location" value={formData.location} onChange={handleFormChange} placeholder="Location" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
          <input name="timings" value={formData.timings} onChange={handleFormChange} placeholder="Timings" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
        </>
      );
    }
    return (
      <>
        <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Patient name" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
        <input name="age" value={formData.age} onChange={handleFormChange} type="number" min="0" max="130" placeholder="Age" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
        <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required>
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
        <input name="disease" value={formData.disease} onChange={handleFormChange} placeholder="Disease" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500" required />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-800 bg-slate-900/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">ClinicFlow</p>
          <h1 className="mt-3 text-2xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-400">Welcome, {authUser?.name}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-emerald-300">role: {authUser?.role}</p>

          <div className="mt-8 space-y-2">
            <button type="button" onClick={() => switchEntity(ENTITY.DOCTOR)} className={`w-full rounded-lg px-4 py-2 text-left font-semibold cursor-pointer transition ${activeEntity === ENTITY.DOCTOR ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-100 hover:bg-slate-700"}`}>Manage Doctors</button>
            <button type="button" onClick={() => switchEntity(ENTITY.RECEPTIONIST)} className={`w-full rounded-lg px-4 py-2 text-left font-semibold cursor-pointer transition ${activeEntity === ENTITY.RECEPTIONIST ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-100 hover:bg-slate-700"}`}>Manage Receptionists</button>
            <button type="button" onClick={() => switchEntity(ENTITY.PATIENT)} className={`w-full rounded-lg px-4 py-2 text-left font-semibold cursor-pointer transition ${activeEntity === ENTITY.PATIENT ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-100 hover:bg-slate-700"}`}>Manage Patients</button>
            <button type="button" onClick={startCreateMode} className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-left font-semibold text-white hover:bg-emerald-600 cursor-pointer transition">Add {getEntityLabel()}</button>
            <button type="button" onClick={fetchActiveList} className="w-full rounded-lg bg-slate-800 px-4 py-2 text-left font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer transition">Refresh List</button>
            <Link to="/dashboard/updateprofile" className="block w-full rounded-lg bg-slate-800 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-700 transition">Update Profile</Link>
          </div>

          <button onClick={handleLogout} className="mt-10 w-full rounded-lg bg-rose-600 px-4 py-2 font-semibold hover:bg-rose-700 cursor-pointer transition">Logout</button>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Doctors</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{loadingCounts ? "..." : totalDoctors}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Receptionists</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{loadingCounts ? "..." : totalReceptionists}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Patients</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{loadingCounts ? "..." : totalPatients}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {activeEntity === ENTITY.DOCTOR ? "Doctors" : activeEntity === ENTITY.RECEPTIONIST ? "Receptionists" : "Patients"}
                </h2>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-medium text-slate-200">{currentList.length} total</span>
              </div>

              {loadingList ? (
                <p className="text-slate-400">Loading...</p>
              ) : currentList.length === 0 ? (
                <p className="text-slate-400">No records found.</p>
              ) : (
                <div className="space-y-3">
                  {currentList.map((item) => (
                    <button key={item._id} type="button" onClick={() => { clearMessages(); setSelectedItemId(item._id); setIsEditMode(false); setFormData(getEmptyFormByEntity(activeEntity)); }} className={`w-full rounded-xl border p-4 text-left transition cursor-pointer ${selectedItemId === item._id ? "border-cyan-400 bg-slate-800" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}>
                      {renderListItem(item)}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
              {successMessage && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

              {isEditMode ? (
                <>
                  <h2 className="mb-4 text-xl font-bold text-white">Update {getEntityLabel()}</h2>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    {renderFormFields()}
                    <div className="flex gap-3">
                      <button type="submit" disabled={isSaving} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">Save Update</button>
                      <button type="button" onClick={() => setIsEditMode(false)} className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-300 cursor-pointer">Cancel</button>
                    </div>
                  </form>
                </>
              ) : selectedItem ? (
                <>
                  <h2 className="mb-4 text-xl font-bold text-white">{getEntityLabel()} Details</h2>
                  {renderDetails()}
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={startEditMode} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600 cursor-pointer">Update</button>
                    <button type="button" onClick={handleDelete} disabled={isSaving} className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer">Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mb-4 text-xl font-bold text-white">Create {getEntityLabel()}</h2>
                  <form onSubmit={handleCreate} className="space-y-4">
                    {renderFormFields()}
                    <button type="submit" disabled={isSaving} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">Create {getEntityLabel()}</button>
                  </form>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
