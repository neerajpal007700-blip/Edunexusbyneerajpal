function cleanString(value, max = 10000) {
  if (value === undefined || value === null) return value;
  return String(value).trim().slice(0, max);
}

function pagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { cleanString, pagination };
