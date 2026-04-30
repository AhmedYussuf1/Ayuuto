export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

export const normalizeText = (value) => String(value).trim();

export const toNullableText = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

export const isValidNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

export const normalizePositiveInteger = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
