// resources/js/components/tables/ProjectsTable.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import api from '../../services/api';
import Pagination from '../common/Pagination'; // reusable pagination
import { Link } from 'react-router-dom';
import { TrashBinIcon, PencilIcon } from '../../icons';
import Swal from 'sweetalert2';

export default function ProjectsTable({ refreshKey, setRefreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'Key' }),
      columnHelper.accessor('name', { 
        header: 'Name',
        cell: ({ getValue, row }) => (
          <Link
            to={`/projects/${row.original.id}`} // SPA route
            className="text-blue-600 hover:underline"
          >
            {getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('status', { header: 'Status' }),
      columnHelper.accessor('start_date', { header: 'Start Date' }),
      columnHelper.accessor('end_date', { header: 'End Date' }),
      columnHelper.accessor('progress', {
        header: 'Progress',
        cell: ({ getValue }) => <span>{getValue()?getValue():0}%</span>,
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
      const res = await api.get('/projects', {
        params: { page: pageIndex + 1, per_page: pageSize },
      });
      setData(res.data.data || []);
      setPageCount(res.data.last_page || 0);
      setTotalRecords(res.data.total || 0); // optional total count
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, refreshKey]);

 const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this project?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d9488',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/delete-project/${id}`);
      fetchData();
      if (setRefreshKey) setRefreshKey(prev => prev + 1);
      Swal.fire('Deleted!', 'The project has been deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete project', err);
      Swal.fire('Error', 'Failed to delete project', 'error');
    }
  }
};
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
    manualPagination: true, // important for server-side pagination
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {loading && <p className="p-4 text-gray-500">Loading projects...</p>}

      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-100 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
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

      {/* Reusable Pagination */}
      <Pagination
        currentPage={pageIndex + 1}
        totalPages={pageCount}
        totalRecords={totalRecords} // optional total count
        pageSize={pageSize}
        onPageChange={(page) => setPageIndex(page - 1)}
      />
    </div>
  );
}