const fs = require("fs").promises;
const path = require("path");
const pm2 = require("pm2");
const os = require("os");

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

    return { urls: serverNames, port: portNumber };
  } catch (error) {
    throw new Error(
      `Failed to extract details from file ${filePath}: ${error.message}`
    );
  }
}

async function createNginxFilesList(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    const fileList = [];
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isFile()) {
        // const { serverNames, portNumber } = await extractFileDetails(fullPath);
        const { urls, port } = await extractFileDetails(fullPath);
        fileList.push({
          // fileName: file,
          confdFilename: file,
          // serverNames,
          // portNumber,
          urls,
          port,
        });
      }
    }

    return fileList;
  } catch (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

async function createPm2AppList() {
  console.log("- in createPm2AppList");

  // Wrap pm2.connect in a Promise
  await new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error("-----> Error caught during pm2.connect");
        return reject(new Error("Failed to connect to PM2"));
      }
      console.log("---> pm2.connect() no error 👍");
      resolve();
    });
  });

  // Wrap pm2.list in a Promise
  const apps = await new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      pm2.disconnect(); // Disconnect PM2
      if (err) {
        console.error("-----> Error caught during pm2.list");
        return reject(new Error("Failed to retrieve app list"));
      }
      console.log("---> pm2.list() no error 👍");

      // Transform the app list into the desired format
      const apps = list.map((app) => ({
        id: app.pm_id,
        name: app.name,
        status: app.pm2_env.status,
        // portNumber: app.pm2_env?.PORT,
        port: app.pm2_env?.PORT,
        appProjectPath: app.pm2_env.pm_cwd ?? "no cwd",
      }));

      // apps.forEach((elem, index) => {
      //   console.log(`appList index #: ${index}`);
      //   console.log(`appList elem:`, elem);
      //   console.log(`appList elem.name: ${elem.name}`);
      // });

      // console.log("- finished createPm2AppList");
      resolve(apps);
    });
  });
  return apps;
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
    if (obj.port in portCount) {
      portCount[obj.port]++;
      duplicates.add(obj.port); // Track duplicates
    } else {
      portCount[obj.port] = 1;
    }
  });

  // Filter out objects with duplicate portNumbers
  const filteredList = objectList.filter((obj) => !duplicates.has(obj.port));

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
      (nginxFile) => nginxFile.port == pm2App.port
    );

    return matchingNginxFile
      ? { ...matchingNginxFile, ...pm2App, localIp: localIpAddress }
      : { ...pm2App, localIp: localIpAddress };
  });

  console.log("--- mergedList ---");
  console.log(mergedList);

  return mergedList;
}

module.exports = {
  getLocalIpAddress,
  createNginxFilesList,
  createPm2AppList,
  mergePm2AndNginxLists,
};
