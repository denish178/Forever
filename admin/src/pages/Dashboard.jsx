import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Dashboard = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchStats = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await axios.post(
        backendUrl + "/api/dashboard/stats",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-gray-500">Could not load dashboard.</p>;
  }

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Total Revenue", value: `${currency}${stats.totalRevenue}` },
    { label: "Pending Orders", value: stats.pendingOrders },
  ];

  return (
    <div>
      <h3 className="text-xl font-medium mb-6">Dashboard</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-gray-200 bg-white rounded-lg p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 bg-white rounded-lg p-5">
          <h4 className="font-medium mb-4">Orders by Status</h4>
          {Object.keys(stats.statusCounts || {}).length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex justify-between border-b border-gray-100 py-2"
                >
                  <span>{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gray-200 bg-white rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Recent Orders</h4>
            <Link to="/orders" className="text-sm underline text-gray-600">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-start border-b border-gray-100 pb-3"
                >
                  <div>
                    <p className="font-medium">
                      {order.address?.firstName} {order.address?.lastName}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(order.date).toLocaleDateString()} ·{" "}
                      {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {currency}
                      {order.amount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
