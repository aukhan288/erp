import React, { useState, useEffect } from 'react';
import SprintsTable from "../components/tables/SprintsTale";
import api from '../services/api';
import Swal from 'sweetalert2';


export default function Sprints() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState('');
    const [editingSprint, setEditingSprint] = useState(null);
    const [refreshKey, setRefreshKey]=useState(0);
      


 const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    projectId: '',
  });

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

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
      // Submit form
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
    setRefreshKey(prev=>prev+1);
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
    
      }

    
      setModalOpen(false);
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
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
 <div className="col-span-12 space-y-6 xl:col-span-12">
  {/* Header and button above table */}
  <div className="flex items-center justify-between gap-4 w-full mb-3">
    <h2 className="text-xl font-bold text-teal-700 dark:text-white">Sprints</h2>
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="bg-teal-600 flex items-center hover:bg-teal-700 text-white py-1 px-2 rounded transition-colors duration-200"
    >
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      New Sprint
    </button>
  </div>

  <SprintsTable  refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
</div>
     
    </div>
        {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
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
    </div>
  );
}