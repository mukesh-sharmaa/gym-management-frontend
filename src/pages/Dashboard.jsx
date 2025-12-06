import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterExpiringDays, setFilterExpiringDays] = useState(7);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalPlans: 0
  });

  // Format date to DD-MMM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, plansRes] = await Promise.all([
        api.get("/members"),
        api.get("/plans")
      ]);
      
      const membersData = membersRes.data || [];
      const plansData = plansRes.data || [];
      
      setMembers(membersData);
      setPlans(plansData);

      // Calculate stats
      const today = new Date();
      const active = membersData.filter(m => m.endDate && new Date(m.endDate) >= today).length;
      const expired = membersData.filter(m => m.endDate && new Date(m.endDate) < today).length;

      setStats({
        totalMembers: membersData.length,
        activeMembers: active,
        expiredMembers: expired,
        totalPlans: plansData.length
      });
    } catch (err) {
      console.error("Fetch data error:", err?.response ?? err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expiringList = () => {
    const today = new Date();
    const upto = new Date();
    upto.setDate(upto.getDate() + (filterExpiringDays || 7));
    return members.filter(m => {
      if (!m.endDate) return false;
      const ed = new Date(m.endDate);
      return ed >= today && ed <= upto;
    });
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome to Gym Management System</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            link="/members"
            color="bg-gradient-to-br from-blue-50 to-blue-100"
            icon={
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            link="/members"
            color="bg-gradient-to-br from-green-50 to-green-100"
            icon={
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Expired Members"
            value={stats.expiredMembers}
            link="/members"
            color="bg-gradient-to-br from-red-50 to-red-100"
            icon={
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Plans"
            value={stats.totalPlans}
            link="/plans"
            color="bg-gradient-to-br from-purple-50 to-purple-100"
            icon={
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* Expiring Members Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Expiring Memberships</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Expiring in</label>
              <input 
                type="number" 
                value={filterExpiringDays} 
                onChange={e => setFilterExpiringDays(+e.target.value)} 
                className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="text-sm text-gray-600">days</span>
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-semibold">
                {expiringList().length}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : expiringList().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No memberships expiring in the next {filterExpiringDays} days</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-580px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Days Left</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringList().map(m => {
                    const daysLeft = Math.ceil((new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={m.id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{m.phone || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{m.plan?.planName ?? "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(m.endDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            daysLeft <= 3 ? "bg-red-100 text-red-800" : 
                            daysLeft <= 7 ? "bg-orange-100 text-orange-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/members" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Add New Member</h3>
                <p className="text-sm text-gray-500">Register a new gym member</p>
              </div>
            </div>
          </Link>
          <Link to="/plans" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Manage Plans</h3>
                <p className="text-sm text-gray-500">View and edit membership plans</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
