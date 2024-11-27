const mongoose = require("mongoose");

const appReverseProxySchema = mongoose.Schema({
  fileName: String,
  urls: [String],
  localIpToApp: String,
  port: Number,
  localIpOfReverseProxy: Number,
  lastUpdatedDate: Date,
  createdDate: { type: Date, default: Date.now },
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "apps",
  },
});

const AppReverseProxy = mongoose.model(
  "appReverseProxies",
  appReverseProxySchema
);

module.exports = AppReverseProxy;
