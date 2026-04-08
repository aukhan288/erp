import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrashBinIcon, PencilIcon } from '../icons';
import Swal from 'sweetalert2';
import moment from 'moment';
import Badge from './ui/badge/Badge';
import { useSelector } from 'react-redux';

export default function Sprints({ projectId: initialProjectId, onSprintAdded, sprintRefreshKey }) {
  const user = useSelector(state => state.auth.user);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [projects, setProjects] = useState([]);
  
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [refreshKey, setRefreshKey]=useState(0);
  const [expandedSprintId, setExpandedSprintId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    
  });

  // Fetch all projects if no projectId
  const fetchProjects = async () => {
    if (!initialProjectId) {
      try {
        const res = await api.get('/projects');
        setProjects(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    }
  };
   useEffect(() => {
    fetchProjects();
  }, []);
  // Fetch sprints
  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await api.get(projectId ? `/sprints/${projectId}` : '/sprints');
      setSprints(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to fetch sprints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [projectId, refreshKey, sprintRefreshKey]);
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users'); // your API endpoint
      // Ensure we get an array
      const usersArray = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(usersArray);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]); // fallback
    }
  };

  fetchUsers();
}, []);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openModal = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData({
        name: sprint.name || '',
        goal: sprint.goal || '',
        start_date: sprint.start_date || '',
        end_date: sprint.end_date || '',
      });
    } else {
      setEditingSprint(null);
      setFormData({ name: '', goal: '', start_date: '', end_date: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmResult = await Swal.fire({
      title: editingSprint ? 'Update Sprint?' : 'Create Sprint?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: editingSprint ? 'Yes, update it!' : 'Yes, create it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#dc2626',
    });
    if (!confirmResult.isConfirmed) return;
     setRefreshKey( prev => prev+1 );
    Swal.fire({
      title: editingSprint ? 'Updating...' : 'Creating...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (editingSprint) {
        await api.put(`/sprints/${editingSprint.id}`, formData);
      } else {
        await api.post(`/create-sprint/${projectId}`, formData);
        if (onSprintAdded) onSprintAdded();
      }

      fetchSprints();
      setModalOpen(false);
      set
      Swal.fire({
        icon: 'success',
        title: editingSprint ? 'Sprint Updated' : 'Sprint Created',
        confirmButtonColor: '#0d9488',
      });
    } catch (err) {
      console.error('Failed to save sprint', err);
      Swal.fire({ icon: 'error', title: 'Oops!', text: 'Failed to save sprint', confirmButtonColor: '#dc2626' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this sprint?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/sprints/${id}`);
        fetchSprints();
        setRefreshKey( prev => prev+1 );
        Swal.fire('Deleted!', 'Sprint has been deleted.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete sprint', 'error');
      }
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:bg-white/[0.03] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-700">Sprints</h3>
        <button className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-800" onClick={() => openModal()}>
          +
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading sprints...</p>
      ) : (
        <ul className="space-y-3">
          {sprints.length > 0 ? (
  sprints.map((s) => (
    <li
      key={s.id}
      className="flex flex-col w-full odd:bg-white even:bg-gray-100 rounded-lg hover:bg-teal-50 transition-colors duration-200 px-2 py-2 cursor-pointer"
      onClick={() => setExpandedSprintId(expandedSprintId === s.id ? null : s.id)}
    >
      {/* Sprint Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{s.name}</span>
          {s.goal && <span className="text-sm text-gray-500">{s.goal}</span>}
          <span className="text-sm text-gray-400">
            {moment(s.start_date).format("Do MMMM YYYY")} → {moment(s.end_date).format("Do MMMM YYYY")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => openModal(s)}>
            <PencilIcon />
          </button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(s.id)}>
            <TrashBinIcon />
          </button>
        </div>
      </div>

      {/* Expandable Tasks */}
      {s.tasks?.length > 0 ? expandedSprintId === s.id && (
        <div className="ml-1 mt-2">
          {s.tasks.map((task) => (
            <div
              key={task.id}
              className="py-1 px-1 border border-gray-300 dark:border-gray-600 rounded mb-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-teal-700 transition-colors duration-200"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium">
                  {task.title}
                
                </p>
     <Badge
                      size="xs"
                      color={task.priority === "high" ? "error" : task.priority === "medium" ? "info" : "success"}
                      variant="solid"
                      className="ml-1"
                    >
                      {task.priority.charAt(0).toUpperCase()}
                    </Badge>
                
              </div>
<button

                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setAssigneeModalOpen(true);
                  }}
                  disabled={task?.completedAt}
                  className="flex items-center gap-2 text-left hover:bg-teal-100 px-2 py-1 rounded"
                >
                  {task?.assignee ? (
                    <>
                      <img src={task.assignee.avatar_url} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                      <span>{task.assignee?.id == user?.id ? "You" : task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">-- Select --</span>
                  )}
                </button>
              {/* Task Dates / Status */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                
                <span className="text-xs text-gray-500">
                  ({task.due_date ? moment(task.due_date).format("Do MMMM YYYY") : "-"})
                </span>
                <span className="text-xs">
                  {task?.completed_at && moment(task.completed_at).format("Do MMMM YYYY")} <br />
                  <small className="text-rose-700">
                    {!task.completed_at && moment(task.due_date).isBefore(moment())
                      ? `Overdue by ${moment().diff(moment(task.due_date), "days")} days`
                      : task.completed_at && moment(task.completed_at).isAfter(moment(task.due_date))
                      ? `Late by ${moment(task.completed_at).diff(moment(task.due_date), "days")} days`
                      : task.completed_at
                      ? `(${moment(task.completed_at).format("Do MMMM YYYY")})`
                      : ""}
                  </small>
                </span>
              </div>

              {task.description && <p>{task.description}</p>}
            </div>
          ))}
        </div>
      ): (
        <p className="text-gray-500">No tasks yet.</p>
      )}
    </li>
  ))
) : (
  <li className="text-gray-500">No sprints yet.</li>
)}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingSprint ? 'Edit Sprint' : 'Add Sprint'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                {!initialProjectId && (
  <div>
    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Project</label>
    <select
      name="project_id"
      value={projectId}
      onChange={(e) => {
        setProjectId(e.target.value);
        setFormData({ ...formData, project_id: e.target.value });
      }}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
      required
    >
      <option value="">-- Select Project --</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
)}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Sprint Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Goal</label>
                <textarea name="goal" value={formData.goal} onChange={handleChange} 
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Start Date</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500" required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">End Date</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

         {assigneeModalOpen && selectedTask && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
      <h4 className="text-lg font-semibold mb-4">Assign Task</h4>

      <select
        className="w-full border rounded px-3 py-2 mb-4"
        value={selectedTask.assignee?.id || ''}
        onChange={async (e) => {
          const assigneeId = e.target.value || null;
          try {
            await api.put(`/assign-task/${selectedTask.id}`, { assignee_id: assigneeId });
            // update local table data
            selectedTask.assignee = users.find(a => a.id == assigneeId) || null;
            setSelectedTask({ ...selectedTask });
            setAssigneeModalOpen(false);
          } catch (err) {
            console.error('Failed to assign task', err);
          }
        }}
      >
        <option value="">-- Select Assignee --</option>
        {users.map(a => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <div className="flex justify-end gap-2">
        <button onClick={() => setAssigneeModalOpen(false)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}