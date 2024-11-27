const app = require("./app"); // Import the configured app
const PORT = process.env.PORT || 3000;

// const APP_NAME = process.env.APP_NAME;
const APP_NAME = "process.env.APP_NAME";
console.log = (
  (log) => (message) =>
    log(`[${APP_NAME}] ${message}`)
)(console.log);
console.error = (
  (log) => (message) =>
    log(`[${APP_NAME}] ${message}`)
)(console.error);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
