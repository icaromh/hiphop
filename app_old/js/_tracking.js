(function() {
  var dummyMethod, getOperatingSystem, getTrackingId, os, resolution, ua, userTracking;

  os = require('os');

  getTrackingId = function() {
    var clientId, uuid;
    clientId = Settings.get("trackingId");
    if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
      uuid = require("node-uuid");
      Settings.set("trackingId", uuid.v4());
      clientId = Settings.get("trackingId");
      if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
        Settings.set("trackingId", uuid.v1());
        clientId = Settings.get("trackingId");
        if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
          clientId = null;
        }
      }
    }
    return clientId;
  };

  ua = require("universal-analytics");

  if (getTrackingId() == null) {
    dummyMethod = function() {
      return {
        send: function() {}
      };
    };
    userTracking = window.userTracking = {
      event: dummyMethod,
      pageview: dummyMethod,
      timing: dummyMethod,
      exception: dummyMethod,
      transaction: dummyMethod
    };
  } else {
    userTracking = window.userTracking = ua("UA-49098639-1", getTrackingId());
  }

  getOperatingSystem = function() {
    var platform;
    platform = os.platform();
    if (platform === "win32" || platform === "win64") {
      return "windows";
    }
    if (platform === "darwin") {
      return "mac";
    }
    if (platform === "linux") {
      return "linux";
    }
    return null;
  };

  userTracking.event("Device Stats", "Version", gui.App.manifest.version).send();

  userTracking.event("Device Stats", "Type", getOperatingSystem()).send();

  userTracking.event("Device Stats", "Operating System", os.type() + " " + os.release()).send();

  userTracking.event("Device Stats", "CPU", os.cpus()[0].model + " @ " + (os.cpus()[0].speed / 1000).toFixed(1) + "GHz" + " x " + os.cpus().length).send();

  userTracking.event("Device Stats", "RAM", Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB").send();

  userTracking.event("Device Stats", "Uptime", Math.round(os.uptime() / 60 / 60) + "hs").send();

  if (typeof screen.width === "number" && typeof screen.height === "number") {
    resolution = screen.width.toString() + "x" + (screen.height.toString());
    if (typeof screen.pixelDepth === "number") {
      resolution += "@" + screen.pixelDepth.toString();
    }
    if (typeof window.devicePixelRatio === "number") {
      resolution += "#" + window.devicePixelRatio.toString();
    }
    userTracking.event("Device Stats", "Resolution", resolution).send();
  }

  userTracking.event("Device Stats", "Language", navigator.language.toLowerCase()).send();

  userTracking.pageview("/").send();

  setInterval((function() {
    return userTracking.event("_KeepAlive", "Pulse").send();
  }), 600 * 1000);

}).call(this);
