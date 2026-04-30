export class AppError extends Error {
  constructor(statusCode, payload) {
    super(payload?.error || "Application error");
    this.statusCode = statusCode;
    this.payload = payload;
    this.isAppError = true;
  }
}

export const sendDatabaseError = (
  res,
  err,
  contextMessage,
  customMessages = {}
) => {
  console.error(contextMessage, err);

  if (err?.isAppError) {
    return res.status(err.statusCode).json(err.payload);
  }

  if (err.code === "23503") {
    return res.status(400).json({
      error: customMessages.foreignKey || "A referenced record does not exist",
      detail: err.detail,
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error:
        customMessages[err.constraint] ||
        customMessages.unique ||
        "This record conflicts with an existing record",
      detail: err.detail,
    });
  }

  if (err.code === "23514") {
    return res.status(400).json({
      error:
        customMessages.check ||
        "One or more values do not satisfy the database rules",
      detail: err.detail || err.message,
    });
  }

  if (err.code === "22P02") {
    return res.status(400).json({
      error:
        customMessages.invalidFormat ||
        "One or more values have an invalid format",
      detail: err.message,
    });
  }

  return res.status(500).json({ error: err.message });
};