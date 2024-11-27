const mongoose = require("mongoose");

const appSchema = mongoose.Schema({
  name: String,
  urls: [String],
  localIp: String,
  port: Number,
  lastUpdatedDate: Date,
  createdDate: { type: Date, default: Date.now },
  machine: { type: mongoose.Schema.Types.ObjectId, ref: "Machine" },
  appReverseProxyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "appReverseProxies",
  },
});

const App = mongoose.model("apps", appSchema);

module.exports = App;
