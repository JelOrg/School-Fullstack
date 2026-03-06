import DOMPurify from "isomorphic-dompurify";

export const sanitizeIn = (req, res, next) => {
  const clean = (data) => {
    if (typeof data === "string") return DOMPurify.sanitize(data).trim();
    if (Array.isArray(data)) return data.map(clean);
    if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, clean(value)]),
      );
    }
    return data;
  };

  req.body = clean(req.body);
  Object.assign(req.query, clean(req.query));
  req.params = clean(req.params);

  next();
};
