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


export default function SprintsTable( { refreshKey, setRefreshKey } ) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);


  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('name', { header: 'Name' }),
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
      columnHelper.accessor('start_date', {
        header: 'Start Date',
        cell: (info) =>
          info.getValue() ? moment(info.getValue()).format('Do MMMM YYYY') : '-',
      }),
      columnHelper.accessor('end_date', {
        header: 'End Date',
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

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await api.get('/sprints', {
      params: { page: pageIndex + 1, per_page: pageSize },
    });

    const sprintsArray = Array.isArray(res.data.data?.data)
      ? res.data.data.data
      : [];

    setData(sprintsArray);
    setPageCount(res.data.data?.last_page || 0);
    setTotalRecords(res.data.data?.total || 0);
  } catch (err) {
    console.error('Failed to fetch sprints', err);
    setData([]);
    setPageCount(0);
    setTotalRecords(0);
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
        await api.delete(`/sprints/${id}`);
        fetchData();
        Swal.fire('Deleted!', 'The sprint has been deleted.', 'success');
        setRefreshKey(prev=>prev+1);
      } catch (err) {
        console.error('Failed to delete sprint', err);
        Swal.fire('Error', 'Failed to delete sprint', 'error');
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
    </div>
  );
}