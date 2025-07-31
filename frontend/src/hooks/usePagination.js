import { useState } from 'react';

const usePagination = (initialPage = 1, initialRowsPerPage = 10) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  return {
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange
  };
};

export default usePagination;