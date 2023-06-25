import ValidationError from '../errors/ValidationError';

export const validateDateFormat = (
  dateString: string | undefined
): string | undefined => {
  if (dateString === undefined) return dateString;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    throw new ValidationError(`Date ${dateString} is of invalid format`);
  }
  return dateString;
};
