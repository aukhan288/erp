import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import api from "../../services/api";
import Pagination from "../common/Pagination";
import { TrashBinIcon, PencilIcon } from "../../icons";
import moment from "moment";
import Swal from "sweetalert2";
import TableLoader from "../common/TableLoader";
 import { useSelector } from 'react-redux';
  

export default function DocumentsTable({
  refreshKey,
  setRefreshKey,
  openModal
}) {
const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [

    columnHelper.accessor("id", { header: "ID" }),

    columnHelper.accessor("title", {
      header: "Title",
    }),

    columnHelper.accessor("document_number", {
      header: "Number",
    }),

    columnHelper.accessor("expiry_date", {
      header: "Expiry",
      cell: (info) =>
        info.getValue()
          ? moment(info.getValue()).format("DD MMM YYYY")
          : "-",
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={`px-2 py-1 text-xs rounded ${
          info.getValue() === "expired"
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }`}>
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("actions", {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">

          <button
            onClick={() => openModal(row.original)}
            className="text-blue-600"
          >
            <PencilIcon />
          </button>

          <button
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600"
          >
            <TrashBinIcon />
          </button>

        </div>
      ),
    }),

  ], []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await api.get("/company-documents", {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
        },
      });

setData(res.data?.data || []);
      setPageCount(res.data.last_page);
      setTotalRecords(res.data.total);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, refreshKey]);

  const handleDelete = async (id) => {

    const confirm = await Swal.fire({
      title: "Delete document?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/company-documents/${id}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    autoResetPageIndex: false,
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
  });

  if (loading) return <TableLoader />;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th key={header.id} className="p-2 text-left">
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 text-sm">
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
        onPageChange={(p) => setPageIndex(p - 1)}
      />

    </div>
  );
}