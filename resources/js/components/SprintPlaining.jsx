import React, { useState, useEffect } from "react";
import api from "../services/api";  
import moment from "moment";
import DropzoneComponent from "../components/DropZone";
import Swal from "sweetalert2";
import { TrashBinIcon, PencilIcon, EyeIcon } from '../icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
  rectIntersection
} from "@dnd-kit/core";
export default function SprintPlaining({ projectId, onTaskDrag, refreshKey }) {

  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintUsers, setSprintUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [files, setFiles] = useState([]);
  const [backlogs, setBacklogs] = useState([]);
  const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);

    const [editingTask, setEditingTask] = useState(null);
      const [selectedTask, setSelectedTask] = useState(null);
        const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      delay: 50,   // must hold for 150ms
      tolerance: 5, // small movement allowed
    },
  })
);

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
       estimated_time: '',
       files: [],
     });

     

  useEffect(() => {
    api.get(`/sprints/${projectId}`)
      .then((res) => {
        setSprints(Array.isArray(res.data.data) ? res.data.data : []);
      });

  }, [projectId, refreshKey]);

  const fetchSprintUsers = async (sprintId) => {
    try {
      const res = await api.get(`/sprints/${sprintId}/users`);  
      setSprintUsers(res.data.data || []);
    }
    catch (err) {
      console.error(err);
    }
  };
  const fetchSprintBacklogs = async (sprintId) => {
    try {
      const res = await api.get(`/sprint-backlogs/${sprintId}`);  
      setBacklogs(res.data || []);
    }
    catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (selectedSprint) {
      fetchSprintUsers(selectedSprint);
      fetchSprintBacklogs(selectedSprint);
    } else {
      setSprintUsers([]);
    } 
  }, [selectedSprint, refreshKey]);
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
        estimated_time: task.estimated_time || null,
        files: [],
      });
      setFiles(task?.files);
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        acceptance_criteria: '',
        description: '',
        milestone_id: '',
        sprint_id: '',
        status: '',
        priority: 'medium',
        assignee_id: '',
        reporter_id: '',
        files: [],
        due_date: '',
        estimated_time: '',
      });
      setFiles([]);
   
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

  // Swal.fire({
  //   title: editingTask ? 'Updating...' : 'Creating...',
  //   allowOutsideClick: false,
  //   didOpen: () => Swal.showLoading(),
  // });

  try {
    const statusMap = { to_do: 1, in_progress: 2, completed: 3 };
    const payload = {
      ...formData,
      project_id: projectId,
      milestone_id: formData.milestone_id || null,
      assignee_id: formData.assignee_id || null,
      reporter_id: formData.reporter_id || null,
      files: files.map(f => f.id),
    };
   

    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, payload);
    } else {
      await api.post(`/create-task/${projectId}`, payload);
    }


    setModalOpen(false);
           if(selectedSprint){
      fetchSprintUsers(selectedSprint);
    }
    if (onTaskDrag) {
  onTaskDrag();
}
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
       if(selectedSprint){
      fetchSprintUsers(selectedSprint);
    }
    if (onTaskDrag) {
  onTaskDrag();
}
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete task', err);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
  }; 

const handleDragEnd = async (event) => {
  const { over, active } = event;

  if (!over) return;

  // ❌ ONLY allow user drops
  if (!over.id.startsWith("user-")) return;

  const taskId = active.id;
  const userId = over.id.replace("user-", "");

  const user = sprintUsers.find(
    (u) => String(u.id) === String(userId)
  );

  if (!user) return;

  try {
    await api.put(`/assign-task/${taskId}`, {
      assignee_id: userId,
      sprint_id: selectedSprint,
    });

    setBacklogs((prev) =>
      prev.map((b) =>
        String(b.id) === String(taskId)
          ? { ...b, assignee: user }
          : b
      )
    );

    if(selectedSprint){
      fetchSprintUsers(selectedSprint);
    }
    if (onTaskDrag) {
  onTaskDrag();
}

  } catch (err) {
    console.error(err);
  }
};

function DroppableUser({ user }) {
  const { setNodeRef } = useDroppable({
    id: `user-${user.id}`,
  });

  return (
    <div ref={setNodeRef} className="p-2 bg-white rounded">
      <img
        src={user.avatar_url}
        alt={user.name}
        className="w-8 h-8 rounded-full inline-block mr-2"
      />

      <span>
        <small>{user.name}</small><br />
        <small>
          {Math.floor(user.allocated_minutes / 60)} hr {user.allocated_minutes % 60} min /
          {Math.floor(user.sprint_capacity_minutes / 60)} hr {user.sprint_capacity_minutes % 60} min
        </small>
      </span>
    </div>
  );
}
function DraggableBacklogCard({
  backlog,
  selected,
  openModal,
  handleDelete,
  setSelectedTask,
  setAssigneeModalOpen,
  selectedSprint,
  sprints,
  sprintUsers,
  user,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: backlog.id,
      disabled: false, // 👈 ONLY selected items draggable
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}

      onClick={(e) => e.stopPropagation()}
      className={`bg-white border mb-1 ${
        selected ? "border-teal-700" : "border-gray-200"
      } rounded-md shadow-sm overflow-hidden text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center  w-full">
        <div
          className="flex-1 px-3 py-2 font-medium text-teal-700 bg-white"
          {...listeners}
          {...attributes}
          title={backlog.title}
        >
         {backlog.title.length > 70
  ? backlog.title.substring(0, 70) + "..."
  : backlog.title}
        </div>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
             setViewTask(backlog),
             setViewTaskModalOpen(true)
           }
          }
          className="text-blue-600 mr-1"
        >
          <EyeIcon />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => openModal(backlog)}
          className="text-blue-600 mr-1"
        >
          <PencilIcon />
        </button>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => handleDelete(backlog.id)}
          className="text-red-600 mr-1"
        >
          <TrashBinIcon />
        </button>
      </div>

      <div className="px-3 pb-2 space-y-0.5 text-xs">
{/* <p>
  Estimation:{" "}
  {backlog?.estimated_time ? (
    <>
      {Math.floor(backlog.estimated_time / 60) > 0 &&
        `${Math.floor(backlog.estimated_time / 60)} hr `}
      {backlog.estimated_time % 60 > 0 &&
        `${backlog.estimated_time % 60} min`}
    </>
  ) : 'N/A'}
</p> */}
        {/* <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();

            if (!selectedSprint) {
              Swal.fire({
                icon: "warning",
                title: "Select Sprint First",
                text: "Please select a sprint before assigning a task.",
              });
              return;
            }

            setSelectedTask(backlog);
            setAssigneeModalOpen(true);
          }}
          className="flex items-center gap-2 text-left hover:bg-teal-100 px-2 py-1 rounded w-full"
        >
          {backlog?.assignee ? (
            <>
              <img
                src={backlog.assignee.avatar_url}
                className="w-6 h-6 rounded-full"
              />
              <span>
                {backlog.assignee?.id === user?.id
                  ? "You"
                  : backlog.assignee.name}
              </span>
            </>
          ) : (
            <span className="text-gray-400">-- Assign to --</span>
          )}
        </button> */}
      </div>
    </div>
  );
}
  return (
    <DndContext
  sensors={sensors}
  collisionDetection={rectIntersection}
  onDragEnd={handleDragEnd}
>
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
           
      <h2 className="text-2xl font-bold mb-4 text-teal-700 ">Planning Board</h2>
       
     
      {/* 12-column grid layout */}
      <div className="grid grid-cols-12 gap-4">

        {/* BACKLOG (7 columns) */}
        <div className="col-span-7 bg-gray-100 p-4 rounded-lg min-h-[400px]">
             <div className="flex flex-row justify-between items-center">
          <h3 className="font-semibold mb-2 text-teal-700">Backlog</h3>
         
          </div>

         <div className="mb-2 gap-3">
{backlogs.map((backlog) => (
  <DraggableBacklogCard
    key={backlog.id}
    backlog={backlog}

    openModal={openModal}
  handleDelete={handleDelete} 
    setSelectedTask={setSelectedTask}
    setAssigneeModalOpen={setAssigneeModalOpen}
    selectedSprint={selectedSprint}
    sprints={sprints}
    sprintUsers={sprintUsers}
   
  />
))}
</div>
        </div>

        {/* USERS (3 columns) */}
        <div className="col-span-3 bg-gray-100 p-4 rounded-lg min-h-[400px]">
          <h3 className="font-semibold mb-2">Users</h3>

          <div className="space-y-2">
           {sprintUsers.map((user) => (
  <DroppableUser key={user.id} user={user} />
))}
          </div>
        </div>

        {/* SPRINTS (2 columns) */}
        <div className="col-span-2 bg-gray-100 p-4 rounded-lg min-h-[400px]">
          <h3 className="font-semibold mb-2">Sprints</h3>

          <div className="space-y-2">
            {sprints.map((sprint) => (
              <div
                key={sprint.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedSprint === sprint.id ? "bg-teal-700 text-white" : "bg-white"
                }`}
                onClick={() => setSelectedSprint(sprint.id)}
              >
                <strong>{sprint.name}</strong> <br />
                <small>Start: {moment(sprint.start_date).format("MMMM Do YYYY")}</small><br />
                <small>End: {moment(sprint.end_date).format("MMMM Do YYYY")}</small>
              </div>
            ))}

          </div>
        </div>

      </div>
      
       {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Backlog' : 'Add Backlog'}</h4>
            <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto max-h-[80vh] mb-5 pb-5 mt-5">
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
                    <div>
                <label className="block mb-1 font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
               {/* Description */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Acceptance Criteria</label>
                <textarea
                  name="acceptance_criteria"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  value={formData.acceptance_criteria}
                  onChange={handleChange}
                />
              </div>
        
<div>
  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Milestone </label>
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
         <div className="grid grid-cols-12 gap-4">

  {/* Priority */}
  <div className="col-span-12 md:col-span-4">
    <label className="block mb-1 font-medium text-gray-700">
      Priority
    </label>

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

  {/* Estimated Time */}
  <div className="col-span-12 md:col-span-8">
    <label className="block mb-1 font-medium text-gray-700">
      Estimated Time (minutes)
    </label>

    <input
      type="number"
      name="estimated_time"
      min="1"
      placeholder="e.g. 30, 60, 120"
      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      value={formData?.estimated_time+"" || ''}
      onChange={handleChange}
    />
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
 
               <DropzoneComponent files={files} setFiles={setFiles}  />
              
              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {viewTaskModalOpen && viewTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg animate-fade-in">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-200">
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
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{viewTask.description}</p>
                </div>
              )}
              {viewTask.acceptance_criteria && (
                <div>
                  <p className="text-sm text-gray-500">Acceptance Criteria</p>
                  <p className="text-gray-700">{viewTask.acceptance_criteria}</p>
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
            
            <table className="min-w-full divide-y divide-gray-200">
      
              {/* Header */}
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                </tr>
              </thead>
      
              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-100">
      
                {viewTask.files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-gray-50 transition"
                  >
                    
                    {/* File Name */}
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        📄 {file.name}
                      </a>
                    </td>
      
                    {/* Size */}
                    <td className="px-4 py-3 text-sm text-gray-600">
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
      {assigneeModalOpen && selectedTask && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
      <h4 className="text-lg font-semibold mb-4">Assign Task</h4>

      <select
        className="w-full border rounded px-3 py-2 mb-4"
        value={selectedTask.assignee?.id || ''}
        onChange={async (e) => {

          const assigneeId = e.target.value || null;
     
          if (!selectedSprint) return;
          try {
            await api.put(`/assign-task/${selectedTask.id}`, { assignee_id: assigneeId,
               sprint_id: selectedSprint,
             });
            // update local table data
            selectedTask.assignee = sprintUsers.find(a => a.id == assigneeId) || null;
            setSelectedTask({ ...selectedTask });
            setAssigneeModalOpen(false);
          } catch (err) {
            console.error('Failed to assign task', err);
          }
        }}
      >
        <option value="">-- Select Assignee --</option>
        {sprintUsers.map(a => (
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
    </DndContext>
  );
}