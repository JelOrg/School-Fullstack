import DOMPurify from "isomorphic-dompurify";

export const sanitizeOut = (req, res, next) => {
  // 1. For regular JSON APIs
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const cleanData = JSON.parse(DOMPurify.sanitize(JSON.stringify(data)));
    return originalJson(cleanData);
  };

  // 2. For SSE streams
  res.vitalsWrite = (data) => {
    if (!res.writableEnded) {
      const safeData = JSON.parse(DOMPurify.sanitize(JSON.stringify(data)));
      res.write(`data: ${JSON.stringify(safeData)}\n\n`);
    }
  };

  next();
};
