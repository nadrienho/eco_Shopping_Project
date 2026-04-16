"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useSession } from "next-auth/react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


interface DashboardMetrics {
  total_co2_saved: number;
  eco_purchases: number;
  average_eco_score: number;
  co2_savings_over_time: { month: string; total_co2_saved: number }[];
  recent_purchases: {
    id: number;
    created_at: string;
    total_cost: number;
    items: { name: string; price: number; quantity: number }[];
  }[];
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (status !== "authenticated") return;

      setLoading(true);
      try {
        const token = session?.user?.access_token;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }

        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchDashboardMetrics();
    }
  }, [status, session]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!metrics) {
    return <p>No data available.</p>;
  }

  // Prepare data for the bar chart
  const barChartData = {
    labels: metrics.co2_savings_over_time.map((entry) => entry.month),
    datasets: [
      {
        label: "CO2 Savings (kg)",
        data: metrics.co2_savings_over_time.map((entry) => entry.total_co2_saved),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-black-900">Customer Dashboard</h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white border border-green-300 rounded-lg shadow">
          <h2 className="text-lg font-bold text-green-600">Total CO2 Saved</h2>
          <p className="text-3xl font-bold text-black">{metrics.total_co2_saved.toFixed(2)} kg</p>
        </div>
        <div className="p-6 bg-white border border-green-300 rounded-lg shadow">
          <h2 className="text-lg font-bold text-green-600">Number of EcoPurchases</h2>
          <p className="text-3xl font-bold text-black">{metrics.eco_purchases}</p>
        </div>
        <div className="p-6 bg-white border border-green-300 rounded-lg shadow">
          <h2 className="text-lg font-bold text-green-600">Average EcoScore</h2>
          <p className="text-3xl font-bold text-black">{metrics.average_eco_score.toFixed(2)}</p>
        </div>
      </div>

      {/* CO2 Savings Over Time */}
      <div className="mb-10 bg-white p-6 border border-green-300 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-black">CO2 Savings Over Time</h2>
        <Bar data={barChartData} />
      </div>

      {/* Recent Purchases */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-black">Recent Purchases</h2>
        <div className="space-y-4">
          {metrics.recent_purchases.map((order) => (
            <div key={order.id} className="p-4 bg-white border border-green-300 rounded-lg shadow">
              <h3 className="text-lg font-bold text-black">Order #{order.id}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
              </p>
              <ul className="mt-2 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm text-black">
                    {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-bold text-black">Total: ${order.total_cost.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
  </div>
  );
}