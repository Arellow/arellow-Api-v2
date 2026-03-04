export const parseBoolean = (value: any): boolean => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
};