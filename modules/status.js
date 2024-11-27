const fs = require("fs").promises;
const path = require("path");

async function listNginxFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    // Filter only files (not directories)
    const fileList = [];
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        fileList.push(file);
      }
    }

    return fileList;
  } catch (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

module.exports = { listNginxFiles };
