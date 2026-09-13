// Small, dependency-free input validation shared across the CRUD routes.
// Existing routes only checked "is this field present" — this adds the next
// layer (type, length, format) without pulling in a schema library for what
// is still a handful of plain object shapes.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `schema`: { field: { required?, maxLength?, email?, min?, max? } }
// Returns an array of human-readable error strings — empty means valid.
// Unknown/extra fields on `body` are ignored (routes already pick only the
// fields they care about before inserting).
export function validate(body, schema) {
  const errors = [];
  const b = body || {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = b[field];
    const isEmpty = value === undefined || value === null || value === "";

    if (rules.required && isEmpty) {
      errors.push(`${field} is required.`);
      continue;
    }
    if (isEmpty) continue; // optional and not provided — nothing else to check

    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`${field} must be ${rules.maxLength} characters or fewer.`);
    }
    if (rules.email && !EMAIL_RE.test(String(value))) {
      errors.push(`${field} must be a valid email address.`);
    }
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`${field} must be at least ${rules.min}.`);
    }
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`${field} must be at most ${rules.max}.`);
    }
  }

  return errors;
}

// Express middleware form — validates req.body against `schema` and 400s
// with the first error if anything fails, otherwise calls next().
export function validateBody(schema) {
  return (req, res, next) => {
    const errors = validate(req.body, schema);
    if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
    next();
  };
}
