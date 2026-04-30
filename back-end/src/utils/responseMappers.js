export const mapRowToResponse = (row, ModelClass, toResponse) => {
  if (!row) {
    return null;
  }

  const modelObject = ModelClass.fromDatabase(row);
  return toResponse(modelObject);
};

export const mapRowsToResponse = (rows, ModelClass, toResponse) =>
  rows.map((row) => mapRowToResponse(row, ModelClass, toResponse));
