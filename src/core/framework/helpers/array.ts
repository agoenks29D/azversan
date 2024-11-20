type PaginationResult<T> = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: T[];
};

/**
 * This function is used to paginate an array of data.
 *
 * @param data - The array of data to be paginated.
 * @param page - The page number to retrieve (starting from 1).
 * @param itemsPerPage - The number of items to display per page.
 */
export const arrayPagination = <T>(
  data: T[],
  page: number,
  itemsPerPage: number,
): PaginationResult<T> => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    totalItems,
    totalPages,
    currentPage,
    data: paginatedData,
  };
};
