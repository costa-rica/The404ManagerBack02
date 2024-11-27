const checkBody = (object) => {
  for (const element in object) {
    if (object[element] || object[element] != "") {
      console.log("return true");
      return true;
    } else {
      console.log("return false");
      return false;
    }
  }
};

module.exports = { checkBody }; // Exports the function globally
