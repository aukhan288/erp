import React, { useState, useEffect } from 'react';
import TasksTable from "../components/tables/TasksTale";
import api from '../services/api';
import Swal from 'sweetalert2';


export default function Tasks() {
    const [modalOpen , setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
      const [sprints, setSprints] = useState([]);
      const [milestones, setMilestones] = useState([]);
        const [statuses, setStatuses] = useState([]);
        const [projectId, setProjectId] = useState(null);
        const [projects, setProjects] = useState([]);
          const [refreshKey, setRefreshKey]=useState(0)
      


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestone_id: '',
    status: '',
    priority: 'medium',
    sprint_id: '',
    milestone_id: '',
    assignee_id: '',
    reporter_id: '',
    due_date: '',
  });
  useEffect(() => {
  console.log('Fetching task statuses');

  const fetchStatuses = async () => {
    console.log('Inside fetchStatuses');
    try {
      const res = await api.get('/task-statuses');
      console.log('Statuses response:', res);

    setStatuses(Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch task statuses', err);
      setStatuses([]); // fallback
    }
  };

  fetchStatuses();
}, []);
 // Fetch all projects if no projectId
  const fetchProjects = async () => {

      try {
        const res = await api.get('/projects');
        setProjects(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    
  };
  
   useEffect(() => {
    fetchProjects();
  }, []);
    // Fetch sprints
    const fetchSprints = async () => {
    try {      const res = await api.get(projectId ? `/sprints/${projectId}` : '/sprints');
      setSprints(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
        console.error('Failed to fetch sprints', err);
    }
  }
    useEffect(() => {
    fetchSprints();
  }, [projectId]);
    // Fetch milestones
  const fetchMilestones = async () => {
    try {
      const res = await api.get(projectId ? `/milestones/${projectId}` : '/milestones');
      setMilestones(Array.isArray(res.data.data) ? res.data.data : []);
    }
        catch (err) {
        console.error('Failed to fetch milestones', err);
    }
  }
    useEffect(() => {
    fetchMilestones();
  }
    , [projectId]);
    // Fetch statuses
    const fetchStatuses = async () => {
    try {

        const res = await api.get('/task-statuses');
        setStatuses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
        console.error('Failed to fetch statuses', err);
    }

    }
  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
      // Submit form
const handleSubmit = async (e) => {
  e.preventDefault();

  const confirmResult = await Swal.fire({
    title: editingTask ? 'Update Task?' : 'Create Task?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: editingTask ? 'Yes, update it!' : 'Yes, create it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d9488',
    cancelButtonColor: '#dc2626',
  });

  if (!confirmResult.isConfirmed) return;

  Swal.fire({
    title: editingTask ? 'Updating...' : 'Creating...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const statusMap = { pending: 1, in_progress: 2, completed: 3 };
    const payload = {
      ...formData,
      project_id: projectId,
      status_id: Number(formData.status),
      milestone_id: formData.milestone_id || null,
      assignee_id: formData.assignee_id || null,
      reporter_id: formData.reporter_id || null,
    };

    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, payload);
    } else {
      await api.post(`/create-task/${projectId}`, payload);
    }

    
    setModalOpen(false);
    setRefreshKey(prev => prev + 1);

    Swal.fire({
      icon: 'success',
      title: editingTask ? 'Task Updated' : 'Task Created',
      confirmButtonColor: '#0d9488',
    });
  } catch (err) {
    console.error('Failed to save task', err);
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'Failed to save task. Please try again.',
      confirmButtonColor: '#dc2626',
    });
  }
};

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
         <div className="flex items-center justify-between gap-4 w-full mb-3">
      <h2 className="text-xl font-bold text-teal-700 dark:text-white">Tasks</h2>
        <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-teal-600 flex items-center hover:bg-teal-700 text-white py-1 px-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Task
          </button>
            </div>
          <TasksTable refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
    </div>
        {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Title */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* projects */}
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
              <div>
  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Sprint</label>
  <select
    name="sprint_id"
    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
    value={formData.sprint_id || ''}
    onChange={handleChange}
    required
  >
    <option value="">Select Sprint</option>
    {sprints.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name} ({new Date(s.start_date).toLocaleDateString()} - {new Date(s.end_date).toLocaleDateString()})
      </option>
    ))}
  </select>
</div>
<div>
  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Milestone</label>
  <select
    name="milestone_id"
    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
    value={formData.milestone_id || ''}
    onChange={handleChange}
  >
    <option value="">No Milestone</option>
    {milestones.map((m) => (
      <option key={m.id} value={m.id}>
        {m.name} ({m.due_date ? new Date(m.due_date).toLocaleDateString() : 'No date'})
      </option>
    ))}
  </select>
</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Status */}
     <div>
  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Status</label>
  <select
    name="status"
    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
    value={formData.status || ''}
    onChange={handleChange}
    required
  >
    <option value="">Select status</option>
    {statuses.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
</div>

              {/* Priority */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Priority</label>
                <select
                  name="priority"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
             </div>

              {/* Due Date */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>
  {/* Description */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Description</label>
                <textarea
                  name="description"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}