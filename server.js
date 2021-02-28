#!/usr/bin/env node

const wifi = require("node-wifi");
const fs = require("fs");
const predict = require("./predict2.js");
const command = process.argv[2];
const room = process.argv[3];
let sample = [];

if (!command) {
  console.log("You forgot to pass a command argument.");
  process.exit(9);
}

if (!room && command !== "predict") {
  console.error("You forgot to pass a command argument.");
  process.exit(9);
}

wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

const getNetworks = () => {
  return wifi.scan((error, networks) => {
    if (error) {
      throw new Error(error);
    }

    const networkObject = {};
    networks.forEach((network) => {
      const key = `${network.ssid} ${network.bssid}`;
      const value = network.quality;
      networkObject[key] = value;
      return networkObject;
    });
    sample.push(networkObject);
    if (sample.length < 5) {
      getNetworks();
    } else {
      fs.writeFile(
        `./data/${room}.json`,
        JSON.stringify(sample),
        function (err, data) {
          if (err) {
            return console.log(err);
          }
        }
      );
    }
    return sample;
  });
};

const predictLocation = () => {
  return wifi.scan((error, networks) => {
    if (error) {
      throw new Error(error);
    }
    const networkObject = {};
    networks.forEach((network) => {
      const key = `${network.ssid} ${network.bssid}`;
      const value = network.quality;
      networkObject[key] = value;
      return networkObject;
    });

    sample.push(networkObject);
    return predict(sample);
  });
};

if (command === "learn") {
  getNetworks();
}

if (command === "predict") {
  predictLocation();
}
