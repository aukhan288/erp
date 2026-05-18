import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function SprintTeamManager({ projectId }) {
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState("");
  const [sprintUsers, setSprintUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSprints();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedSprint) fetchSprintUsers();
    else setSprintUsers([]);
  }, [selectedSprint]);

  // ---------------- API ----------------

  const fetchSprints = async () => {
    try {
      const res = await api.get(`/sprints/${projectId}`);
      setSprints(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users`);
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSprintUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sprints/${selectedSprint}/users`);
      setSprintUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOGGLE (BEST UX) ----------------

  const toggleUser = async (userId) => {
    try {
      await api.post(`/toggle-sprint-user/${selectedSprint}`, {
        user_id: userId,
      });

      const exists = sprintUsers?.some((u) => u.id === userId);

      if (exists) {
        setSprintUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const user = users.find((u) => u.id === userId);
        setSprintUsers((prev) => [...prev, user]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isAssigned = (userId) =>
    sprintUsers?.some((u) => u.id === userId);

  // ---------------- UI ----------------

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm mb-3">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-teal-700">
          Sprint Team Manager
        </h2>

        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
        >
          <option value="">Select Sprint</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* EMPTY STATE */}
      {!selectedSprint && (
        <div className="text-sm text-gray-500">
          Please select a sprint to manage team
        </div>
      )}

      {/* USERS GRID */}
      {selectedSprint && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((user) => {
            const assigned = isAssigned(user.id);

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition ${
                  assigned
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200"
                }`}
              >
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url}
                    className="w-10 h-10 rounded-full"
                  />

                  <div>
                    <p className="font-medium text-sm">
                      {user.firstname} {user.lastname}
                    </p>

             
             {assigned && (() => {
  const sprintUser = (sprintUsers || []).find((u) => u.id === user.id);

  const format = (mins = 0) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr`;
    return `${m} min`;
  };

  return (
    <p className="text-xs text-gray-500">
      {format(sprintUser?.allocated_minutes || 0)} used out of{" "}
      {format(sprintUser?.sprint_capacity_minutes || 0)} capacity
    </p>
  );
})()}
                  </div>
                </div>

                {/* ACTION */}
                <button
                  onClick={() => toggleUser(user.id)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    assigned
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {assigned ? "Remove" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}