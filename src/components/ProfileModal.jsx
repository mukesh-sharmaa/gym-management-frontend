// src/components/ProfileModal.jsx
import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function ProfileModal({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/profile");
      setProfile(response.data);
    } catch (error) {
      toast.error("Failed to fetch profile");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Greyed out and inaccessible */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Centered and compact */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : profile ? (
              <div className="space-y-4">
                {/* Admin Information */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Admin Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Name</label>
                      <p className="text-sm text-gray-900 font-semibold">{profile.adminName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900 font-semibold break-all">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900 font-semibold">{profile.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Gym Information */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                    </svg>
                    Gym Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Gym Name</label>
                      <p className="text-sm text-gray-900 font-semibold">{profile.gymName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Address</label>
                      <p className="text-sm text-gray-900 font-semibold">{profile.gymAddress}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Contact Number</label>
                      <p className="text-sm text-gray-900 font-semibold">{profile.gymContactNumber}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Failed to load profile data</p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
