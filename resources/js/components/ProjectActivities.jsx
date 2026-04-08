import React, { useEffect, useState } from "react";
import api from "../services/api";
import moment from "moment";

export default function ProjectActivities({ projectId, refreshKey }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/project-activities/${projectId}`);
      setActivities(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen to projectId and refreshKey changes
  useEffect(() => {
    if (projectId) fetchActivities();
  }, [projectId, refreshKey]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-hidden">
      <h3 className="mb-3 font-semibold text-teal-700 dark:text-white">Activity Log</h3>
      {loading ? (
        <p className="text-gray-500">Loading activities...</p>
      ) : activities.length ? (
        <ul className="space-y-2 text-sm">
          {activities.map((a) => (
<li
  key={a.id}
  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 border-l border-teal-700"
>
  {/* Avatar */}
  <div className="flex-shrink-0 overflow-hidden rounded-full h-10 w-10">
    <img
      src={a?.user?.avatar_url}
      alt={a.user?.name || "User"}
      className="h-full w-full object-cover"
    />
  </div>

  {/* Content */}
  <div className="flex-1">
    <div className="flex items-center space-x-1">
      <span className="font-semibold text-gray-800">
        {a.user?.name || "System"}
      </span>
    </div>
    <div className="flex items-center space-x-1">
        <span className="text-gray-400 text-xs">
        {moment(a.created_at).format("Do MMMM YYYY, h:mm A")}
      </span>
    </div>
    <p className="text-gray-700 text-sm mt-0.5">{a.description}</p>
  </div>
</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No activities yet.</p>
      )}
    </div>
  );
}