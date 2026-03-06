import DOMPurify from "isomorphic-dompurify";

export const sanitizeOut = (req, res, next) => {
  // 1. For regular JSON APIs
  const originalJson = res.json;
  res.json = function (data) {
    const cleanData = JSON.parse(DOMPurify.sanitize(JSON.stringify(data)));
    return originalJson.call(this, cleanData);
  };

  // 2. For your SSE Heartbeat (Helper function)
  res.vitalsWrite = (data) => {
    const safeData = JSON.parse(DOMPurify.sanitize(JSON.stringify(data)));
    res.write(`data: ${JSON.stringify(safeData)}\n\n`);
  };

  next();
};