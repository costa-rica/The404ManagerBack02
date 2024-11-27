const mongoose = require("mongoose");

const machineSchema = mongoose.Schema({
  machineName: String,
  localIp: String,
  the404ApiUrl: String,
  lastUpdatedDate: Date,
  createdDate: { type: Date, default: Date.now },
  appId: [{ type: mongoose.Schema.Types.ObjectId, ref: "App" }],
});

const Machine = mongoose.model("machines", machineSchema);

module.exports = Machine;
