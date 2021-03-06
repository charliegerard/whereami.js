#!/usr/bin/env node
const wifi = require("node-wifi");
const fs = require("fs");
var dir = "./whereamijs-data";
const predict = require("./predict.js");
const loading = require("loading-cli");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const command = process.argv[2];
const room = process.argv[3];
let sample = [];
let load;

if (!command) {
  console.log(`You forgot to pass a command argument.

  Options: 
    learn, -l <room>, get and save wifi data for a specific room
    predict, -p, predict current location
    rooms, -r, list the rooms in the training data
  `);
  process.exit(9);
}

if (!room && command === "learn") {
  console.error(
    `You forgot to specify a room. For example: whereamijs learn kitchen`
  );
  process.exit(9);
}

wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

const getNetworks = () => {
  if (!load) {
    load = loading({
      text: "✨ Getting Wifi data 📶 This can take up to 15s! ✨",
      color: "yellow",
      frames: ["◰", "◳", "◲", "◱"],
    }).start();
  }
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
      load.stop();
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.writeFile(
        `${dir}/${room}.json`,
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
  if (!load) {
    load = loading({
      text: "✨ Predicting current location... ✨",
      color: "yellow",
      frames: ["◰", "◳", "◲", "◱"],
    }).start();
  }
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
    load.stop();
    return predict(sample);
  });
};

const listRooms = async () => {
  try {
    let rooms = await readdir(`./whereamijs-data`);
    rooms.map((room) => console.log(room.split(".")[0]));
    return;
  } catch (err) {
    console.log(err);
  }
};

if (command === "learn" || command === "-l") {
  getNetworks();
}

if (command === "predict" || command === "-p") {
  predictLocation();
}

if (command === "rooms" || command === "-r") {
  listRooms();
}
