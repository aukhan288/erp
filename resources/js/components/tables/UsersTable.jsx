// components/tables/UsersTable.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import api from '../../services/api';
import Pagination from '../common/Pagination'; // import reusable pagination
import TableLoader from '../common/TableLoader'; // import loader component
import { Link } from 'react-router-dom';
import moment from "moment";
import { useSelector } from "react-redux";

export default function UsersTable({usersTableRefreshKey, setUsersTableRefreshKey}) {
  const { user } = useSelector((state) => state.auth);

  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statuses, setStatuses] = useState([]);

  const columnHelper = createColumnHelper();

 const columns = useMemo(
  () => [
    columnHelper.accessor("id", { header: "ID" }),

    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => {
        const row = info.row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 overflow-hidden rounded-full h-8 w-8">
              <img
                src={row?.avatar_url}
                alt={row?.firstname + " " + row?.lastname || "User"}
                className="h-full w-full object-cover"
              />
            </div>

            <Link to={`/profile/${row.id}`} className="text-sm font-medium text-gray-800 hover:underline">
              <strong>{row?.firstname + " " + row?.lastname}</strong> <br />
{
  row?.roles
    ?.filter(role => role?.pivot?.company_id === user?.active_company_id)
    ?.map(role => (
      <span
        key={role.id}
        className="ml-1 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
      >
        {role.name}
      </span>
    ))
}
            </Link>
          </div>
        );
      },
    }),

    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("mobile", { header: "Mobile" }),
    columnHelper.accessor("created_at", { header: "Created At",
       cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format("Do MMMM YYYY")
            : "No date",
     }),
  ],
  []
);

  const fetchData = async () => {
    setLoading(true);
  
    try {
      const res = await api.get('/users', {
        params: { page: pageIndex + 1, per_page: pageSize },
      });
      setData(res.data.data);
      setPageCount(res.data.last_page);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, usersTableRefreshKey]);

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

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {loading? <TableLoader /> 
        : <>

      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-200">
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

      {/* Reusable Pagination */}
      
        <Pagination
            currentPage={pageIndex + 1}
            totalPages={pageCount}
            totalRecords={totalRecords}   // 👈 add this
            pageSize={pageSize}
            onPageChange={(page) => setPageIndex(page - 1)}
        />
    </>}
    </div>
  );
}