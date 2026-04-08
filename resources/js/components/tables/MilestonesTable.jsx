// components/tables/MilestonesTable.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import Swal from "sweetalert2";
import { TrashBinIcon, PencilIcon } from '../../icons';
import { Link } from "react-router-dom";
import api from "../../services/api";
import Pagination from "../common/Pagination";
import moment from "moment";

export default function MilestonesTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      due_date: '',
      status: 'pending',
      project_id: ""
    });

    // Open modal for adding or editing
  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name || '',
        description: milestone.description || '',
        due_date: milestone.due_date || '',
        status: milestone.status || 'pending',
        project_id: milestone.project_id || 0
      });
    } else {
      setEditingMilestone(null);
      setFormData({ name: '', description: '', due_date: '', status: 'pending', project_id: "" });
    }
    setModalOpen(true);
  };

    const handleChange = (e) => {

      
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
      }),

      columnHelper.accessor("name", {
        header: "Milestone",
      }),
      columnHelper.accessor("project.name", {
        header: "Project",
        cell: (info) => {
          return      <Link
        to={`/projects/${info.row.original.project_id}`} // SPA route
        className="text-teal-600 hover:underline"
      >
        {info.getValue() || 'Unknown Project'}
      </Link>;
        }
      }),

      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("Do MMMM YYYY")
            : "No date",
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();

          const color =
            status === "completed"
              ? "bg-teal-500"
              : status === "in_progress"
              ? "bg-yellow-400"
              : "bg-slate-400";

          return (
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${color}`}></span>
              <span className="capitalize">{status.replace("_", " ")}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const milestone = info.row.original; 
          return (
                 <div className="flex gap-2">
                              <button
                                className="text-blue-600 hover:underline"
                                onClick={() => openModal(milestone)}
                              >
                                <PencilIcon />
                              </button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDelete(milestone.id)}
                              >
                                <TrashBinIcon />
                              </button>
                            </div>
          );
        },
      }),
    ],
    []
  );

  const fetchData = async () => {
    setLoading(true);

    try {
  const res = await api.get("/milestones", {
    params: {
      page: pageIndex + 1,
      per_page: pageSize,
    },
  });

      const milestones = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setData(milestones);
      setPageCount(res.data.last_page || 1);
      setTotalRecords(res.data.total || milestones.length);
    } catch (err) {
      console.error("Failed to fetch milestones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;

      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
      await api.post(`/create-milestone/${formData.project_id}`, formData);

        Swal.close();

  // Now trigger the parent callback
  if (typeof onMilestoneAdded === "function") {
    onMilestoneAdded();
  }
    }

    // Refresh list and close modal
    fetchData();
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
      fetchData();
      Swal.fire('Deleted!', 'The milestone has been deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete milestone', err);
      Swal.fire('Error', 'Failed to delete milestone', 'error');
    }
  }
};
  return (
    <div>
           <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-700">Milestones</h3>
        <button
          className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-800"
          onClick={() => openModal()}
        >
          + Milestones
        </button>
      </div>
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">

      {loading && (
        <p className="p-4 text-gray-500">Loading milestones...</p>
      )}

      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {typeof header.column.columnDef.header === "function"
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  {cell.column.columnDef.cell
                    ? cell.column.columnDef.cell(cell.getContext())
                    : cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={pageIndex + 1}
        totalPages={pageCount}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={(page) => setPageIndex(page - 1)}
      />
    </div>
     {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
    <h4 className="text-lg font-semibold mb-4">
      {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
    </h4>
    <form onSubmit={handleSubmit} className="space-y-3">
       <div>
    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Project</label>
    <select
      name="project_id"
      value={formData.project_id}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
      required
    >
      <option value="">-- Select Project --</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
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
    </div>
  );
}