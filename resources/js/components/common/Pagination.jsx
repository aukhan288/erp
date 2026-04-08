// components/Pagination.jsx
import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords = 0,
  pageSize = 10,
}) {
  if (totalPages === 0) return null;

  // 🔥 calculate record range
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  const generatePages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= 2 ||
        i > totalPages - 2 ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - 3 ||
        i === currentPage + 3
      ) {
        pages.push('ellipsis-' + i);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4  w-full">

      {/* 🔥 RECORD INFO */}
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Showing <span className="font-semibold">{start}</span> to{' '}
        <span className="font-semibold">{end}</span> of{' '}
        <span className="font-semibold">{totalRecords}</span> results
      </p>

      {/* PAGINATION */}
      <nav className="flex justify-center">
        <ul className="flex -space-x-px text-sm">

          {/* Previous */}
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8  rounded-l bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ‹
            </button>
          </li>

          {/* Pages */}
          {generatePages().map((page, idx) =>
            typeof page === 'number' ? (
              <li key={idx}>
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8  ${
                    currentPage === page
                      ? 'bg-teal-600 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              </li>
            ) : (
              <li key={idx} className="w-10 h-10 flex items-center justify-center">
                ...
              </li>
            )
          )}

          {/* Next */}
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8  rounded-r bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ›
            </button>
          </li>

        </ul>
      </nav>
    </div>
  );
}