import React, { useState, useEffect } from "react";
import api from "../services/api";
import moment from "moment";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import Swal from "sweetalert2";


export default function BackLog({ projectId, onTaskDrag  }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [milestones, setMilestones] = useState([]);
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

  const sensors = useSensors(useSensor(PointerSensor));


    // Open modal for add/edit
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || null,
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

    Swal.fire({
      icon: 'success',
      title: editingTask ? 'Backlog Updated' : 'Backlog Created',
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
  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
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
const fetchData = async () => {
  setLoading(true);
  try {
    const [tasksRes, usersRes, sprintsRes] = await Promise.all([
      api.get(`/backlog/${projectId}`),
      api.get(`/users`),
      api.get(`/sprints/${projectId}`),
    ]);

    setTasks(tasksRes.data);
    setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || []);
    setSprints(
      Array.isArray(sprintsRes.data.data) ? sprintsRes.data.data : []
    );
  } catch (err) {
    console.error("Failed to fetch data", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, [projectId]);

  const handleDragStart = (event) => {
    setActiveTask(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  const taskId = active.id;

  try {
    if (over.id.startsWith("user-")) {
      const userId = parseInt(over.id.split("-")[1]);
      await api.put(`/assign-task/${taskId}`, { assignee_id: userId });
    }

    if (over.id.startsWith("sprint-")) {
      const sprintId = parseInt(over.id.split("-")[1]);
      await api.put(`/assign-task/${taskId}`, { sprint_id: sprintId });
    }

    // Refetch tasks from server after update
    await fetchData();
     if (onTaskDrag) onTaskDrag();
  } catch (err) {
    console.error("Failed to update task", err);
  } finally {
    setActiveTask(null);
  }
};

  if (loading) return <p>Loading backlog...</p>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="border-gray-300 grid grid-cols-12 gap-4 p-2 border rounded-lg bg-white shadow-sm">
        {/* BACKLOG */}
        <div className="col-span-12 md:col-span-8 space-y-2">
          <div className="flex flex-row justify-between items-center">
            <h3 className="text-lg font-semibold text-teal-700 mb-2">Backlog</h3>
            <button 
            onClick={() => openModal()}
            className="info rounded border border-teal-700 bg-white text-teal-700 py-1 px-4 font-medium hover:bg-teal-700 hover:text-white transition-colors duration-200 mb-4">
              + Backlog
            </button>
          </div>
      <div className="flex flex-wrap gap-3">
  {tasks.map((task) => (
    <div key={task.id} className="w-[240px]">
      <DraggableTask task={task} />
    </div>
  ))}
</div>
        </div>

        {/* USERS */}
        <div className="col-span-12 md:col-span-2 space-y-2">
          <h3 className="text-lg font-semibold text-teal-700 mb-2">Users</h3>

          {users.map((user) => (
            <DroppableUser key={user.id} user={user} />
          ))}
        </div>

        {/* SPRINTS */}
        <div className="col-span-12 md:col-span-2 space-y-2">
          <h3 className="text-lg font-semibold text-teal-700 mb-2">Sprints</h3>

          {sprints.map((sprint) => (
            <DroppableSprint key={sprint.id} sprint={sprint} />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="border rounded-lg p-4 bg-white shadow-lg">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
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
    </DndContext>
  );
}

function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

return (


   
  <div
    ref={setNodeRef}
    {...listeners}
    {...attributes}
    style={style}
    className="rounded-md shadow-sm overflow-hidden cursor-move bg-white border border-gray-200 text-sm"
  >
    {/* Header */}
    <div className="bg-teal-700 text-white px-3 py-1.5 font-medium text-sm">
      {task.title}
    </div>

    {/* Body */}
    <div className="bg-gray-50 px-3 py-2 space-y-0.5 text-xs">
       Assigned to: {task.assignee ? task.assignee.name : "Unassigned"}
       <br />
         
      <p>
        <span className="font-semibold">Milestone:</span>{" "}
        {task.milestone?.name || "No Milestone"}
      </p>
      <p>
        <span className="font-semibold">Sprint:</span>{" "}
        {task?.sprint?.name || "No Sprint"}
      </p>

      <p>
        <span className="font-semibold">Due:</span>{" "}
        {task.due_date
          ? moment(task.due_date).format("D MMM YYYY")
          : "No Due"}
      </p>

      <p>
        <span className="font-semibold">Priority:</span>{" "}
        {task.priority || "medium"}
      </p>
      <p>
        <span className="font-semibold">Description:</span>{" "}
        {task.description || "No description"}
      </p>
    </div>
  </div>
);
}

function DroppableUser({ user }) {
  const { setNodeRef } = useDroppable({
    id: `user-${user.id}`,
  });

  return (
<div
  ref={setNodeRef}
  className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
>
  <div className="flex flex-row gap-2 w-full items-center">
    <img
      src={user.avatar_url}
      alt={user.name}
      className="h-8 w-8 rounded-full"
    />

    <span className="text-sm font-medium text-gray-800 leading-tight">
      {user.name}
      <span className="block text-xs text-gray-500">
      {user.completed_tasks} of {user.assigned_tasks} tasks
    </span>
    </span>
  </div>

</div>
  );
}

function DroppableSprint({ sprint }) {
  const { setNodeRef } = useDroppable({
    id: `sprint-${sprint.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="border rounded-lg p-2 bg-white shadow-sm"
    >
      {sprint.name}
    </div>
  );
}