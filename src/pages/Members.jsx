// src/pages/Members.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/Members.css";

// Delete Confirmation Modal
function DeleteConfirmModal({ memberName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-gray-800">Delete Member?</h3>
        <p className="text-center text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-900">{memberName}</span>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Member form modal (Add / Edit)
function MemberForm({ initial = null, plans = [], onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [planId, setPlanId] = useState(initial?.plan?.id || (plans[0]?.id || ""));
  const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0,10) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? initial.endDate.slice(0,10) : "");

  useEffect(() => {
    if (!initial && startDate && planId) {
      const p = plans.find(pl => String(pl.id) === String(planId));
      if (p) {
        const months = p.durationInMonths || 0;
        const dt = new Date(startDate);
        dt.setMonth(dt.getMonth() + months);
        setEndDate(dt.toISOString().slice(0,10));
      }
    }
    // eslint-disable-next-line
  }, [planId, startDate]);

  const submit = async (e) => {
    e.preventDefault();

    // Validation: all required except email
    if (!name.trim() || !phone.trim() || !planId || !startDate || !endDate) {
      toast.error("Please fill all required fields (email is optional)");
      return;
    }

    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!initial && start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        planId: +planId,
        startDate,
        endDate
      };

      if (initial?.id) {
        await api.put(`/members/${initial.id}`, payload);
        toast.success("Member updated");
      } else {
        await api.post("/members", payload);
        toast.success("Member created");
      }
      onSaved();
    } catch (err) {
      console.error("Member save error:", err?.response ?? err);
      toast.error(err?.response?.data ? String(err.response.data) : "Could not save member");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40 p-4">
      <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">{initial?.id ? "Edit Member" : "Add Member"}</h3>

        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />

        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />

        <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />

        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Plan *
        </label>
        <div className="relative mb-4">
          <select 
            value={planId} 
            onChange={e => setPlanId(e.target.value)} 
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
            required
          >
            <option value="" disabled>Select a gym plan</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.planName ?? p.plan_name ?? p.name ?? `Plan ${p.id}`} - {p.durationInMonths ?? p.duration ?? "?"} month{(p.durationInMonths ?? p.duration) !== 1 ? 's' : ''} (₹{p.price})
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Start Date *
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                min={!initial ? new Date().toISOString().split('T')[0] : undefined}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-400 transition-colors shadow-sm cursor-pointer"
                required 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              End Date *
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                min={startDate || undefined}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-400 transition-colors shadow-sm cursor-pointer"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">{initial?.id ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}

// Renew modal same as before
function RenewModal({ member, plans = [], onClose, onRenewed }) {
  const [newEndDate, setNewEndDate] = useState(member?.endDate ? member.endDate.slice(0,10) : "");
  const [planId, setPlanId] = useState(member?.plan?.id || member?.planId || (plans[0]?.id || ""));

  const submit = async (e) => {
    e.preventDefault();
    if (!planId || !newEndDate) {
      toast.error("Please select a plan and end date");
      return;
    }

    // Date validation
    const currentEndDate = new Date(member.endDate);
    const newEnd = new Date(newEndDate);

    if (newEnd < currentEndDate) {
      toast.error("New end date cannot be before current end date");
      return;
    }
    try {
      await api.put(`/members/${member.id}/renew`, { 
        planId: +planId,
        newEndDate 
      });
      toast.success("Membership renewed");
      onRenewed();
    } catch (err) {
      console.error("Renew error:", err?.response ?? err);
      toast.error("Could not renew");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40 p-4">
      <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Renew {member.name}</h3>

        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Select Plan *
        </label>
        <div className="relative mb-4">
          <select 
            value={planId} 
            onChange={e => setPlanId(e.target.value)} 
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
            required
          >
            <option value="" disabled>Select a gym plan</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.planName ?? p.plan_name ?? p.name ?? `Plan ${p.id}`} - {p.durationInMonths ?? p.duration ?? "?"} month{(p.durationInMonths ?? p.duration) !== 1 ? 's' : ''} (₹{p.price})
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          New end date *
        </label>
        <div className="relative mb-6">
          <input 
            type="date" 
            value={newEndDate} 
            onChange={e => setNewEndDate(e.target.value)} 
            min={member?.endDate ? member.endDate.slice(0,10) : undefined}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none hover:border-green-400 transition-colors shadow-sm cursor-pointer"
            required 
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
          <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md">Renew</button>
        </div>
      </form>
    </div>
  );
}


export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showRenew, setShowRenew] = useState(false);
  const [renewMember, setRenewMember] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMember, setDeleteMember] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Format date to DD-MMM-YYYY (e.g., 15-Nov-2025)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data || []);
    } catch (err) {
      console.error("Fetch plans error:", err?.response ?? err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/members");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Fetch members error:", err?.response ?? err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, []);

  const onAdd = () => { setEditing(null); setShowForm(true); };
  const onEdit = (m) => { setEditing(m); setShowForm(true); };

  const onDeleteClick = (m) => {
    setDeleteMember(m);
    setShowDeleteConfirm(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteMember) return;
    try {
      await api.delete(`/members/${deleteMember.id}`);
      toast.success("Member deleted");
      setShowDeleteConfirm(false);
      setDeleteMember(null);
      fetchMembers();
    } catch (err) {
      console.error("Delete member error:", err?.response ?? err);
      toast.error("Could not delete member");
    }
  };

  const onCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteMember(null);
  };

  const onOpenRenew = (m) => { setRenewMember(m); setShowRenew(true); };
  const onCloseRenew = () => { setRenewMember(null); setShowRenew(false); };

  // Export members to CSV
  const exportToCSV = () => {
    if (filteredMembers.length === 0) {
      toast.error("No members to export");
      return;
    }

    const headers = ["Name", "Phone", "Email", "PlanId", "StartDate", "EndDate"];
    const csvData = filteredMembers.map(m => [
      m.name || "",
      m.phone || "",
      m.email || "",
      m.planId || m.plan?.id || "",
      m.startDate || "",
      m.endDate || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `members_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredMembers.length} members`);
  };

  // Import members from CSV using backend API
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/members/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Backend returns a string message with success/error details
      const message = response.data;
      
      // Parse the response to show appropriate toasts
      if (message.includes("successfully imported")) {
        toast.success(message, { autoClose: 4000 });
        fetchMembers();
      } else if (message.includes("Error") || message.includes("Missing")) {
        toast.error(message, { autoClose: 5000 });
      } else {
        toast.info(message, { autoClose: 4000 });
        fetchMembers();
      }

    } catch (err) {
      console.error("Import error:", err);
      const errorMsg = err?.response?.data || "Failed to import members";
      
      // If backend returns detailed errors, show them
      if (typeof errorMsg === 'string' && errorMsg.includes("Row")) {
        const lines = errorMsg.split('\n');
        lines.slice(0, 5).forEach(line => {
          if (line.trim()) toast.error(line, { autoClose: 4000 });
        });
        if (lines.length > 5) {
          toast.warning(`${lines.length - 5} more errors occurred`, { autoClose: 3000 });
        }
      } else {
        toast.error(errorMsg, { autoClose: 4000 });
      }
    }

    e.target.value = ""; // Reset file input
  };

  // Filter members based on search query
  const filteredMembers = members.filter(m => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Members</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your gym members</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Members..."
                className="w-full p-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-400 transition-colors shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button onClick={onAdd} className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2" title="Add Member">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Member</span>
            </button>
            <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium shadow-md transition-colors flex items-center justify-center" title="Export to CSV">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <label className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg font-medium shadow-md transition-colors flex items-center justify-center cursor-pointer" title="Import from CSV">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v6m0 0l-3-3m3 3l3-3m-3 3v6m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button onClick={fetchMembers} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm flex items-center justify-center" title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Loading members...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden sm:table-cell">Start</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Days Left</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map(m => {
                    const daysLeft = m.endDate ? Math.ceil((new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{m.phone || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{m.email || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{m.plan?.planName ?? m.plan?.plan_name ?? m.plan?.name ?? (m.planId ? `Plan ${m.planId}` : "-")}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{formatDate(m.startDate)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${m.endDate && (new Date(m.endDate) <= new Date() ? "text-red-600 bg-red-50" : "text-gray-600")}`}>
                        {formatDate(m.endDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {daysLeft !== null ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            daysLeft < 0 ? 'bg-red-100 text-red-800' :
                            daysLeft <= 7 ? 'bg-orange-100 text-orange-800' :
                            daysLeft <= 30 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button 
                            onClick={() => onEdit(m)} 
                            className="px-2 sm:px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg transition-colors font-medium flex items-center gap-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => onOpenRenew(m)} 
                            className="px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-1"
                            title="Renew"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Renew</span>
                          </button>
                          <button 
                            onClick={() => onDeleteClick(m)} 
                            className="px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center gap-1"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}

                  {filteredMembers.length === 0 && (
                    <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      {searchQuery ? `No members found matching "${searchQuery}"` : 'No members found'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <MemberForm
          initial={editing}
          plans={plans}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchMembers(); }}
        />
      )}

      {showRenew && renewMember && (
        <RenewModal
          member={renewMember}
          plans={plans}
          onClose={() => onCloseRenew()}
          onRenewed={() => { onCloseRenew(); fetchMembers(); }}
        />
      )}

      {showDeleteConfirm && deleteMember && (
        <DeleteConfirmModal
          memberName={deleteMember.name}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}
    </div>
  );
}
