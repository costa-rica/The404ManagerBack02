const fs = require("fs").promises;
const path = require("path");

// async function listNginxFiles(directoryPath) {
//   try {
//     const files = await fs.readdir(directoryPath);

//     // Filter only files (not directories)
//     const fileList = [];
//     for (const file of files) {
//       const fullPath = path.join(directoryPath, file);
//       const stat = await fs.stat(fullPath);
//       if (stat.isFile()) {
//         fileList.push(file);
//       }
//     }

//     return fileList;
//   } catch (error) {
//     throw new Error(`Failed to list files: ${error.message}`);
//   }
// }

/**
 * Extracts server names and port numbers from a configuration file.
 * @param {string} filePath - Path to the configuration file.
 * @returns {Promise<{ serverNames: string[], portNumber: string }>}
 */
async function extractFileDetails(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    let serverNames = [];
    let portNumber = null;

    const lines = fileContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Extract server_name
      if (trimmedLine.startsWith("server_name")) {
        const match = trimmedLine.match(/server_name\s+([^;]+);/);
        if (match) {
          serverNames = match[1].split(" ").map((name) => name.trim());
        }
      }

      // Extract proxy_pass port
      if (trimmedLine.startsWith("proxy_pass")) {
        const match = trimmedLine.match(/proxy_pass\s+.*:(\d{4});/);
        if (match) {
          portNumber = match[1];
        }
      }
    }

    return { serverNames, portNumber };
  } catch (error) {
    throw new Error(
      `Failed to extract details from file ${filePath}: ${error.message}`
    );
  }
}

/**
 * Lists all files in a specified directory and extracts additional details.
 * @param {string} directoryPath - Path to the directory.
 * @returns {Promise<{ fileName: string, serverNames: string[], portNumber: string }[]>}
 */
async function listNginxFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    const fileList = [];
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isFile()) {
        const { serverNames, portNumber } = await extractFileDetails(fullPath);
        fileList.push({
          fileName: file,
          serverNames,
          portNumber,
        });
      }
    }

    return fileList;
  } catch (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

module.exports = { listNginxFiles };
