const fs = require("fs").promises;
const path = require("path");
const pm2 = require("pm2");
const os = require("os");

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
async function createNginxFilesList(directoryPath) {
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

function createPm2AppList() {
  console.log("- in createPm2AppList");
  if (process.env.NODE_ENV != "production") {
    console.error(
      "* sending fauxData due to process.env.NODE_ENV not production *"
    );
    return { appsList: fauxData };
  }
  pm2.connect((err) => {
    if (err) {
      console.log("-----> errro caought");
      console.error(err);
      // return res.status(500).send({ error: "Failed to connect to PM2" });
      return { error: "Failed to connect to PM2" };
    }

    pm2.list((err, list) => {
      pm2.disconnect(); // Disconnect PM2
      if (err) {
        console.error(err);
        // return res.status(500).send({ error: "Failed to retrieve app list" });
        return { error: "Failed to retrieve app list" };
      }

      // if (list.length == 0) {
      //   // return res.json({ result: true, appsList: fauxData });
      //   return { result: true, appsList: fauxData };
      // }
      // using map like this appends a {} for each 'app' in list
      const apps = list.map((app) => ({
        id: app.pm_id,
        name: app.name,
        status: app.pm2_env.status,
        portNumber: app.pm2_env?.PORT,
        appProjectPath: app.pm2_env.pm_cwd ?? "no cwd",
      }));
      apps.map((elem,index) =>{
        console.log(`appList index #: ${index}`)
        console.log(`appList elem: ${elem}`)
        console.log(`appList elem.name: ${elem.name}`)
      })
      console.log("- finished createPm2AppList")
      console.log("- finished createPm2AppList")
      // return res.json(apps);
      // return res.json({ result: true, appsList: apps });
      return { result: true, "appsList": apps };
    });
  });
}

// Function to get the local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return "127.0.0.1"; // Default to localhost if no address is found
}

// Helper function to find duplicates in a list by portNumber
function filterDuplicatePorts(objectList) {
  const portCount = {};
  const duplicates = new Set();

  // Count occurrences of each portNumber
  objectList.forEach((obj) => {
    if (obj.portNumber in portCount) {
      portCount[obj.portNumber]++;
      duplicates.add(obj.portNumber); // Track duplicates
    } else {
      portCount[obj.portNumber] = 1;
    }
  });

  // Filter out objects with duplicate portNumbers
  const filteredList = objectList.filter(
    (obj) => !duplicates.has(obj.portNumber)
  );

  // Log a message for each removed portNumber
  duplicates.forEach((port) => {
    console.log(`-----> Objects with portNumber ** ${port} ** were removed.`);
  });

  return filteredList;
}

function mergePm2AndNginxLists(pm2AppList, nginxFilesList) {
  // Detect duplicates in both lists
  console.log(" loop over pm2AppList");
  const pm2NoDups = filterDuplicatePorts(pm2AppList);
  console.log(" loop over nginxFilesList");
  const nginxNoDups = filterDuplicatePorts(nginxFilesList);
  const localIpAddress = getLocalIpAddress();

  const mergedList = pm2NoDups.map((pm2App) => {
    const matchingNginxFile = nginxNoDups.find(
      (nginxFile) => nginxFile.portNumber == pm2App.portNumber
    );
    return matchingNginxFile
      ? { ...matchingNginxFile, ...pm2App, localIpAddress }
      : { ...pm2App, localIpAddress };
  });

  return mergedList;
}

module.exports = {
  getLocalIpAddress,
  createNginxFilesList,
  createPm2AppList,
  mergePm2AndNginxLists,
};

const fauxData = [
  {
    id: 11,
    name: "FunkyChicken",
    status: "stopped",
    portNumber: 8001,
  },
  {
    id: 13,
    name: "The404ManagerFront",
    status: "online",
    portNumber: 8004,
  },
  {
    id: 14,
    name: "The404ManagerBack",
    status: "online",
    portNumber: 8000,
  },
];
