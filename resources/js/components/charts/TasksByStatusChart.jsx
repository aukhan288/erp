import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import api from "../../services/api"; // use your API service

const TasksByStatusChart = ({ projectId }) => {
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setLoading(true);
        const url = projectId
          ? `/tasks/status-count/${projectId}`
          : `/tasks/status-count`;

        const response = await api.get(url); // use api instance
        setStatusCounts(response.data);
      } catch (error) {
        console.error("Error fetching task statuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusCounts();
  }, [projectId]);

  const series = Object.values(statusCounts);
  const options = {
    labels: Object.keys(statusCounts),
    colors: ["#808080", "#F59E0B", "#10B981", "#00786F"], // Tailwind colors
    legend: { position: "bottom", fontSize: "14px", labels: { colors: "#374151" } },
    tooltip: { y: { formatter: (val) => `${val} tasks` } },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%`, style: { fontSize: '10px', colors: ['#ffffff'] } },
    chart: { type: "donut" },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5 text-gray-500">
        Loading task statuses...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-2 py-2">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Tasks by Status
        </h3>
      </div>
      <div className="border-t border-gray-100 p-6 dark:border-gray-800 flex justify-center">
        <Chart options={options} series={series} type="donut" width={300} />
      </div>
    </div>
  );
};

export default TasksByStatusChart;