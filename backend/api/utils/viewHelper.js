import path from "path";

export const view = (fileName) => (req, res) => {
  // This points to: School Opdracht/frontend/html/filename.html
  const filePath = path.join(
    process.cwd(),
    "..",
    "frontend",
    "html",
    `${fileName}.html`,
  );
  res.sendFile(filePath);
};
