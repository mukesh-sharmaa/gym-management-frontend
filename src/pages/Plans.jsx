// src/pages/Plans.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/Plans.css";

// Delete Confirmation Modal
function DeleteConfirmModal({ planName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-gray-800">Delete Plan?</h3>
        <p className="text-center text-gray-600 mb-6">Are you sure you want to delete the <span className="font-semibold text-gray-900">{planName}</span> plan? This action cannot be undone.</p>
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

function PlanForm({ initial, onClose, onSaved }) {
  const [planName, setPlanName] = useState(initial?.planName || "");
  const [durationInMonths, setDurationInMonths] = useState(initial?.durationInMonths || 1);
  const [price, setPrice] = useState(initial?.price || 0);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) {
        await api.put(`/plans/${initial.id}`, { planName, durationInMonths: +durationInMonths, price: +price });
        toast.success("✓ Plan updated successfully!", {
          className: "shadow-xl",
          progressClassName: "bg-gradient-to-r from-green-400 to-green-600"
        });
      } else {
        await api.post("/plans", { planName, durationInMonths: +durationInMonths, price: +price });
        toast.success("✓ Plan created successfully!", {
          className: "shadow-xl",
          progressClassName: "bg-gradient-to-r from-green-400 to-green-600"
        });
      }
      onSaved();
    } catch (err) {
      // api interceptor shows message
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40 p-4">
      <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">{initial?.id ? "Edit Plan" : "Add Plan"}</h3>

        <label className="block text-sm font-medium text-gray-700 mb-2">Plan name</label>
        <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />

        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
        <input type="number" min="1" value={durationInMonths} onChange={(e) => setDurationInMonths(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />

        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
        <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">{initial?.id ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePlan, setDeletePlan] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/plans");
      setPlans(res.data);
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const onAdd = () => { setEditing(null); setShowForm(true); };
  const onEdit = (plan) => { setEditing(plan); setShowForm(true); };
  
  const onDeleteClick = (plan) => {
    setDeletePlan(plan);
    setShowDeleteConfirm(true);
  };

  const onConfirmDelete = async () => {
    if (!deletePlan) return;
    try {
      await api.delete(`/plans/${deletePlan.id}`);
      toast.success("✓ Plan deleted successfully!", {
        className: "shadow-xl",
        progressClassName: "bg-gradient-to-r from-red-400 to-red-600"
      });
      setShowDeleteConfirm(false);
      setDeletePlan(null);
      fetchPlans();
    } catch (err) {}
  };

  const onCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePlan(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Plans</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your gym plans</p>
            </div>
          </div>
          <button onClick={onAdd} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Plan</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Plan ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Duration (months)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.planName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{p.durationInMonths}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{p.price}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button 
                            onClick={() => onEdit(p)} 
                            className="px-2 sm:px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg transition-colors font-medium flex items-center gap-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => onDeleteClick(p)} 
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
                  ))}
                  {plans.length === 0 && (
                    <tr><td className="px-4 py-8 text-center text-gray-500" colSpan="5">No plans found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <PlanForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchPlans(); }}
        />
      )}

      {showDeleteConfirm && deletePlan && (
        <DeleteConfirmModal
          planName={deletePlan.planName}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}
    </div>
  );
}
