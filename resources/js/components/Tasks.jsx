import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrashBinIcon, PencilIcon } from '../icons';
import Swal from 'sweetalert2';
import AssigneeDropdown from '../components/common/AssigneeDropdown'
import moment from 'moment';
import Pagination from '../components/common/Pagination';
import Badge from './ui/badge/Badge';
import { useSelector } from 'react-redux';

export default function Tasks({ projectId, tasksRefreshKey }) {
  const loaderRef = React.useRef(null);
const observerRef = React.useRef(null);

const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
    const user = useSelector((state) => state.auth.user);
   

const [pageCount, setPageCount] = useState(0);
const [totalRecords, setTotalRecords] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  

  const [users, setUsers] = useState([]);

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sprints, setSprints] = useState([]);
    const [milestones, setMilestones] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    acceptance_criteria: '',
    description: '',
    milestone_id: '',
    status: '',
    priority: 'medium',
    sprint_id: '',
    assignee_id: '',
    reporter_id: '',
    due_date: '',
  });


  const openViewModal = (task) => {
  setViewTask(task);
  setViewTaskModalOpen(true);
};
  // Fetch task statuses
useEffect(() => {
  console.log('Fetching task statuses');

  const fetchStatuses = async () => {
    console.log('Inside fetchStatuses');
    try {
      const res = await api.get('/task-statuses');
      console.log('Statuses response:', res);

      setStatuses(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch task statuses', err);
      setStatuses([]); // fallback
    }
  };

  fetchStatuses();
}, []);
useEffect(() => {
  const fetchMilestones = async () => {
    try {
      const res = await api.get(projectId ? `/milestones/${projectId}` : `/milestones`);
      const milestoneArray = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setMilestones(milestoneArray);
    } catch (err) {
      console.error('Failed to fetch milestones', err);
      setMilestones([]);
    }
  };

  fetchMilestones();
}, []);
useEffect(() => {
  const fetchSprints = async () => {
    try {
      const res = await api.get(projectId ? `/sprints/${projectId}` : `/sprints`);
      const sprintArray = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setSprints(sprintArray);
    } catch (err) {
      console.error('Failed to fetch sprints', err);
      setSprints([]);
    }
  };

  fetchSprints();
}, []);
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
 

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for add/edit
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || null,
        acceptance_criteria: task.acceptance_criteria || null,
        description: task.description || null,
        milestone_id: task.milestone_id || null,
        sprint_id: task.sprint_id || null,
        status: task.status?.id || '',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id || null,
        reporter_id: task.reporter_id || null,
        due_date: task.due_date || null,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        acceptance_criteria: '',
        milestone_id: '',
        sprint_id: '',
        status: '',
        priority: 'medium',
        assignee_id: '',
        reporter_id: '',
        due_date: '',
      });
    }
    setModalOpen(true);
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

    setRefreshKey(prev => prev + 1);
    setModalOpen(false);

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
const fetchData = async (pageNum = 1) => {
  if (loadingMore && pageNum !== 1) return;
  if (!hasMore && pageNum !== 1) return;

  if (pageNum === 1) setLoading(true);
  else setLoadingMore(true);

  try {
    const res = await api.get(`/tasks/${projectId}?page=${pageNum}`);

    const newData = res.data.data || [];

    setTasks((prev) =>
      pageNum === 1 ? newData : [...prev, ...newData]
    );

    setHasMore(res.data.current_page < res.data.last_page);
    setPage(pageNum);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

  useEffect(() => {
    fetchData(1);
  }, [tasksRefreshKey, projectId]);  
useEffect(() => {
  if (!loaderRef.current) return;

  observerRef.current = new IntersectionObserver((entries) => {
    const target = entries[0];

    if (target.isIntersecting && hasMore && !loadingMore) {
      fetchData(page + 1);
    }
  });

  observerRef.current.observe(loaderRef.current);

  return () => {
    if (observerRef.current) observerRef.current.disconnect();
  };
}, [page, hasMore, loadingMore]);
  // Delete task
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/delete-task/${id}`);
        fetchData();
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete task', err);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden p-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-teal-700">Tasks</h3>
        {user?.roles?.some(role => role.name === "admin") && (
        <button
          className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-800"
          onClick={() => openModal()}
        >
          +
        </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto">
  {tasks.length > 0 ? (
    tasks.map((t) => (
      <li key={t.id} className="flex items-center justify-between gap-3 text-body"
      onClick={() => openViewModal(t)}
      >
        <div className="flex flex-col gap-1 w-full p-2 border border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`h-2 w-2 rounded-full ${
                t.status === 'completed'
                  ? 'bg-teal-500'
                  : t.status === 'in_progress'
                  ? 'bg-yellow-400'
                  : 'bg-slate-400'
              }`}
            ></span>

            <span className="font-medium">{t.title}</span>

            <span className="text-sm text-gray-500">
              ({t.due_date ? moment(t.due_date).format("Do MMMM YYYY") : 'No date'})
            </span>

            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
              {t.priority}
              <Badge size="xs"  color={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'yellow' : 'green'} variant="solid" className="ml-1">
                {t.priority.charAt(0).toUpperCase()}
              </Badge>
            </span>


            {/* Assignee dropdown */}
      
        {user?.roles?.some(role => role.name === "admin") && (
              <button
                onClick={() => {
                  setSelectedTask(t); // store the clicked task
                  setAssigneeModalOpen(true);   // open modal
                }}
                disabled={t?.completedAt} // disable if no user is logged in
                className="flex items-center gap-2 text-left hover:bg-teal-100 px-2 py-1 rounded"
              >
                {t?.assignee ? (
                  <>
                    <img src={t.assignee.avatar_url} alt={t.assignee.name} className="w-6 h-6 rounded-full" />
                    <span>{t.assignee?.id==user?.id ? 'You' : t.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">-- Select --</span>
                )}
              </button>
          )}
          </div>

      
        </div>
       {user?.roles?.some(role => role.name === "admin") && (
            
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => openModal(t)}>
            <PencilIcon />
          </button>
          <button className="text-red-600 hover:underline" onClick={() => handleDelete(t.id)}>
            <TrashBinIcon />
          </button>
        </div>
           )}
      </li>

    ))
  ) : (
    <li className="text-gray-500">No tasks yet.</li>
  )}
</ul>
      )}
      <div ref={loaderRef} className="h-10 flex justify-center items-center">
  {loadingMore && <p className="text-gray-500">Loading more...</p>}
</div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[500px] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Description */}
                 <div>
                <label className="block mb-1 font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Acceptance Criteria</label>
                <textarea
                  name="acceptance_criteria"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.acceptance_criteria}
                  onChange={handleChange}
                />
              </div>
           
              <div>
  <label className="block mb-1 font-medium text-gray-700">Sprint</label>
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
  <label className="block mb-1 font-medium text-gray-700">Milestone</label>
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
  <label className="block mb-1 font-medium text-gray-700">Status</label>
  <select
    name="status"
    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
    value={formData?.status || ''}
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
                <label className="block mb-1 font-medium text-gray-700">Priority</label>
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
                <label className="block mb-1 font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.due_date}
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

       {assigneeModalOpen && selectedTask && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
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
          <option key={a.id} value={a.id}>{a.firstname} {a.lastname}</option>
        ))}
      </select>

      <div className="flex justify-end gap-2">
        <button onClick={() => setAssigneeModalOpen(false)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  </div>
)}

{viewTaskModalOpen && viewTask && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <h4 className="text-xl font-semibold text-teal-700">Task Details</h4>
        <button
          onClick={() => setViewTaskModalOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3 text-gray-700">
        
        <div>
          <p className="text-sm text-gray-500">Title</p>
          <p className="font-medium text-gray-800">{viewTask.title}</p>
        </div>
{viewTask.description && (
          <div>
            <p className="text-sm text-gray-500">Acceptance Criteria</p>
            <p className="text-gray-700">{viewTask.acceptance_criteria}</p>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-700">{viewTask.description}</p>
          </div>
        )}
   

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Sprint</p>
            <p className="font-medium">{viewTask.sprint?.name || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Milestone</p>
            <p className="font-medium">{viewTask.milestone?.name || 'None'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              viewTask.status?.name === 'completed' ? 'bg-teal-500 text-white' :
              viewTask.status?.name === 'pending' ? 'bg-yellow-400 text-black' :
              'bg-gray-300 text-gray-800'
            }`}>
              {viewTask.status?.name}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Priority</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              viewTask.priority === 'high' ? 'bg-red-500 text-white' :
              viewTask.priority === 'medium' ? 'bg-yellow-400 text-black' :
              'bg-green-500 text-white'
            }`}>
              {viewTask.priority.charAt(0).toUpperCase() + viewTask.priority.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Assignee</p>
            {viewTask.assignee ? (
              <div className="flex items-center gap-2">
                <img src={viewTask.assignee.avatar_url} alt={viewTask.assignee.name} className="w-6 h-6 rounded-full" />
                <span className="font-medium">{viewTask.assignee.name}</span>
              </div>
            ) : (
              <p className="font-medium">Unassigned</p>
            )}

          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium">{viewTask.due_date ? moment(viewTask.due_date).format('Do MMMM YYYY') : 'No date'}</p>
          </div>
        </div>
             

        {viewTask.files && viewTask.files.length > 0 && (
  <div className="mt-4">
    
    <p className="text-sm font-semibold text-gray-600 mb-2">
      Attachments
    </p>

    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

        {/* Header */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Size
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">

          {viewTask.files.map((file) => (
            <tr
              key={file.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              
              {/* File Name */}
              <td className="px-4 py-3 text-sm">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  📄 {file.name}
                </a>
              </td>

              {/* Size */}
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {file?.size
                  ? `${(file.size / 1024).toFixed(2)} KB`
                  : (
                    <span className="text-gray-400">N/A</span>
                  )}
              </td>

       

            </tr>
          ))}

        </tbody>
      </table>
    </div>
  </div>
)}

      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setViewTaskModalOpen(false)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}