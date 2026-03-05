import DOMPurify from "isomorphic-dompurify";

export const sanitizeIn = (req, res, next) => {
  const clean = (data) => {
    if (typeof data === "string") return DOMPurify.sanitize(data).trim();
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        data[key] = clean(data[key]);
      }
    }
    return data;
  };

  req.body = clean(req.body);
  req.query = clean(req.query);
  req.params = clean(req.params);

  next();
};
