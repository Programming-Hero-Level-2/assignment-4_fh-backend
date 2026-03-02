export const generatePageLink = (
  url: string,
  page?: number | null
): string | null => {
  return page ? url.replace(/page=\d+/, `page=${page}`) : null;
};
