import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrashBinIcon, PencilIcon } from '../icons';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Badge from './ui/badge/Badge';

export default function Milestones({ projectId, onMilestoneAdded  }) {
  const user = useSelector((state) => state.auth.user);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'pending',
  });

  // Fetch milestones
const fetchMilestones = async () => {
  setLoading(true);
  try {

    const res = await api.get( projectId ? `/milestones/${projectId}` : `/milestones`);

    // Ensure milestones is always an array
    const milestonesArray = Array.isArray(res.data.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];

    setMilestones(milestonesArray);
  } catch (err) {
    console.error('Failed to fetch milestones', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for adding or editing
  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name || '',
        description: milestone.description || '',
        due_date: milestone.due_date || '',
        status: milestone.status || 'pending',
      });
    } else {
      setEditingMilestone(null);
      setFormData({ name: '', description: '', due_date: '', status: 'pending' });
    }
    setModalOpen(true);
  };
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
  // Submit form
const handleSubmit = async (e) => {
  e.preventDefault();

  // Confirmation before saving
  const confirmResult = await Swal.fire({
    title: editingMilestone ? 'Update Milestone?' : 'Create Milestone?',
    text: editingMilestone
      ? 'Do you want to update this milestone?'
      : 'Do you want to create this milestone?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: editingMilestone ? 'Yes, update it!' : 'Yes, create it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d9488', // Tailwind-teal
    cancelButtonColor: '#dc2626', // Tailwind-red
  });

  if (!confirmResult.isConfirmed) return;

  // Show loading spinner
  Swal.fire({
    title: editingMilestone ? 'Updating...' : 'Creating...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    if (editingMilestone) {
      // Update milestone
      await api.put(`/milestones/${editingMilestone.id}`, formData);
    } else {
      // Create milestone
      await api.post(`/create-milestone/${projectId}`, formData);

        Swal.close();

  // Now trigger the parent callback
  if (typeof onMilestoneAdded === "function") {
    onMilestoneAdded();
  }
    }

    // Refresh list and close modal
    fetchMilestones();
    setModalOpen(false);

    // Close loading and show success
    Swal.fire({
      icon: 'success',
      title: editingMilestone ? 'Milestone Updated' : 'Milestone Created',
      text: editingMilestone
        ? 'The milestone has been updated successfully.'
        : 'A new milestone has been created successfully.',
      confirmButtonColor: '#0d9488', // Tailwind-teal
    });
  } catch (err) {
    console.error('Failed to save milestone', err);

    // Close loading and show error
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'Failed to save milestone. Please try again.',
      confirmButtonColor: '#dc2626', // Tailwind-red
    });
  }
};

  // Delete milestone
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this milestone?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d9488',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/delete-milestone/${id}`);
      fetchMilestones();
      Swal.fire('Deleted!', 'The milestone has been deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete milestone', err);
      Swal.fire('Error', 'Failed to delete milestone', 'error');
    }
  }
};

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-700">Milestones</h3>
        <button
          className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-800"
          onClick={() => openModal()}
        >
          +
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading milestones...</p>
      ) : (
        <ul className="space-y-1">
          {milestones.length > 0 ? (
  milestones.map((m) => (
    <li
      key={m.id}
      className="flex flex-col w-full odd:bg-white even:bg-gray-100 rounded-lg hover:bg-teal-50 transition-colors duration-200 px-2 py-2 cursor-pointer"
      onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
    >
      {/* Milestone Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2 w-2 rounded-full ${
              m.status === 'completed'
                ? 'bg-teal-500'
                : m.status === 'in_progress'
                ? 'bg-yellow-400'
                : 'bg-slate-400'
            }`}
          ></span>
          <span className="font-medium">{m.name}</span>
          <span className="text-sm text-gray-500">
            ({m.due_date ? moment(m.due_date).format("Do MMMM YYYY") : 'No date'})
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              openModal(m);
            }}
          >
            <PencilIcon />
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(m.id);
            }}
          >
            <TrashBinIcon />
          </button>
        </div>
      </div>

      {/* Milestone Description */}
      {m.description && (
        <div className="text-sm text-gray-600 dark:text-gray-300 ml-5">
          {m.description}
        </div>
      )}

      {/* Expandable Tasks */}
      {m.tasks?.length > 0 && (
        <div
          className={`ml-5 mt-2 overflow-hidden transition-all duration-300 ${
            expandedId === m.id ? 'max-h-96' : 'max-h-0'
          }`}
        >
          {m.tasks.map((task) => (
            <div
              key={task.id}
             className={`py-1 px-1 border border-gray-300 dark:border-gray-600 rounded mb-1 bg-gray-50 dark:bg-gray-800 
  hover:bg-gray-100 dark:hover:bg-gray-700 
  hover:border-teal-700 transition-colors duration-200`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
               <p className="font-medium">{task.title} 
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                  {task.priority}
                  <Badge size="xs"  color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'info' : 'success'} variant="solid" className="ml-1">
                    {task.priority.charAt(0).toUpperCase()}
                  </Badge>
                </span>
               </p>
               
                           <button
                onClick={(e) => {
                   e.stopPropagation();
                  setSelectedTask(task); // store the clicked task
                  setAssigneeModalOpen(true);   // open modal
                }}
                disabled={task?.completedAt} // disable if no user is logged in
                className="flex items-center gap-2 text-left hover:bg-teal-100 px-2 py-1 rounded"
              >
                {task?.assignee ? (
                  <>
                    <img src={task.assignee.avatar_url} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                    <span>{task.assignee?.id==user?.id ? 'You' : task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">-- Select --</span>
                )}
              </button>
              
              </div>
<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  {/* Due Date */}
  <span className='text-xs text-gray-500'>
    ({task.due_date ? moment(task.due_date).format("Do MMMM YYYY") : '-'})
  </span>

  {/* Completed Date / Status */}
<span className='text-xs'>
{task?.completed_at && moment(task.completed_at).format("Do MMMM YYYY")}
<br />
<small className='text-rose-700'>
  { !task.completed_at && moment(task.due_date).isBefore(moment())
      ? `Overdue by ${moment().diff(moment(task.due_date), 'days')} days` // Not completed & overdue
      : task.completed_at && moment(task.completed_at).isAfter(moment(task.due_date))
        ? `Late by ${moment(task.completed_at).diff(moment(task.due_date), 'days')} days` // Completed late
        : task.completed_at
          ? `(${moment(task.completed_at).format("Do MMMM YYYY")})` // Completed on time
          : '' // Pending & not yet due
  }</small>
</span>
</div>
              
            
           
  
              <p>{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  ))
) : (
  <li className="text-gray-500">No milestones yet.</li>
)}
        </ul>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
    <h4 className="text-lg font-semibold mb-4">
      {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
    </h4>
    <form onSubmit={handleSubmit} className="space-y-3">
      
      {/* Milestone Name */}
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="name">
          Milestone Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="due_date">
          Due Date
        </label>
        <input
          id="due_date"
          type="date"
          name="due_date"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
          value={formData.due_date}
          onChange={handleChange}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => setModalOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-800"
        >
          Save
        </button>
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