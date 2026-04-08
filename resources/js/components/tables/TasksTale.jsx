// components/tables/TasksTable.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import api from '../../services/api';
import Pagination from '../common/Pagination';
import { TrashBinIcon, PencilIcon } from '../../icons';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
 import { useDispatch, useSelector } from 'react-redux';
  

export default function TasksTable( { refreshKey, setRefreshKey} ) {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);


  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('title', { header: 'Name' }),
      columnHelper.accessor('project.name', { header: 'Project',
        cell: (info) => {
          const project = info.row.original.project;
          return project ? (
            <Link to={`/projects/${project.id}`} className="text-teal-600 hover:underline">
              {project.name}
            </Link>
          ) : (
            'N/A'
          );
        } 
       }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => info.getValue()?.name || 'N/A',
      }),
      columnHelper.accessor('priority', { header: 'Priority' }),
      columnHelper.accessor('assignee.name', {
  header: 'Assignee',
  cell: ({ row }) => {
    const assignee = row.original.assignee;
    const completedAt = row.original.completed_at;

    return (
      <button
        onClick={() => {
          setSelectedTask(row.original); // store the clicked task
          setAssigneeModalOpen(true);   // open modal
        }}
        disabled={completedAt} // disable if no user is logged in
        className="flex items-center gap-2 text-left hover:bg-teal-100 px-2 py-1 rounded"
      >
        {assignee ? (
          <>
            <img src={assignee.avatar_url} alt={assignee.name} className="w-6 h-6 rounded-full" />
            <span>{assignee?.id==user?.id ? 'You' : assignee.name}</span>
          </>
        ) : (
          <span className="text-gray-400">-- Select --</span>
        )}
      </button>
    );
  },
}),
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: (info) =>
          info.getValue() ? moment(info.getValue()).format('Do MMMM YYYY') : '-',
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          
          <div className="flex gap-2">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => openModal(row.original)}
            >
              <PencilIcon />
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDelete(row.original.id)}
            >
              <TrashBinIcon />
            </button>
          </div>
        ),
      }),
    ],
    []
  );
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
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', {
        params: { page: pageIndex + 1, per_page: pageSize },
      });
      setData(res.data.data);
      setPageCount(res.data.last_page);
      setTotalRecords(res.data.total);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, refreshKey]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });




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
         if (setRefreshKey) setRefreshKey(prev => prev + 1);
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete task', err);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
  };


  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {loading && <p className="p-4 text-gray-500">Loading tasks...</p>}

      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  {typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No tasks found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm text-gray-700"
                  >
                    {cell.column.columnDef.cell
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.getValue()}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={pageIndex + 1}
        totalPages={pageCount}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={(page) => setPageIndex(page - 1)}
      />
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