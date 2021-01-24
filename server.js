#!/usr/bin/env node

const wifi = require("node-wifi");
const tfn = require("@tensorflow/tfjs-node");
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const predict = require("./predict.js");

const command = process.argv[2];
const room = process.argv[3];

let data = [];
let sample = [];

if (!command) {
  console.log("You forgot to pass a command argument.");
  process.exit(9);
}

if (!room && command !== "predict") {
  console.error("You forgot to pass a command argument.");
  process.exit(9);
}

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

// wifi.getCurrentConnections(async (error, currentConnections) => {
//   if (error) {
//     console.log(error);
//   } else {
//     // console.log(currentConnections);

//     if (command === "learn") {
//       while (data.length < 10000) {
//         data.push(currentConnections[0].signal_level);
//       }

//       fs.writeFile(
//         `./data/${room}.json`,
//         JSON.stringify(data),
//         function (err, data) {
//           if (err) {
//             return console.log(err);
//           }
//         }
//       );
//     }

//     if (command === "predict") {
//       console.log(currentConnections);
//       while (data.length < 10000) {
//         data.push(currentConnections[0].signal_level);
//       }
//       const handler = tfn.io.fileSystem("./model/model.json");
//       const model = await tf.loadLayersModel(handler);
//       predict.predict(model, data);
//     }
//     /*
//     // you may have several connections
//     [
//         {
//             iface: '...', // network interface used for the connection, not available on macOS
//             ssid: '...',
//             bssid: '...',
//             mac: '...', // equals to bssid (for retrocompatibility)
//             channel: <number>,
//             frequency: <number>, // in MHz
//             signal_level: <number>, // in dB
//             quality: <number>, // same as signal level but in %
//             security: '...' //
//             security_flags: '...' // encryption protocols (format currently depending of the OS)
//             mode: '...' // network mode like Infra (format currently depending of the OS)
//         }
//     ]
//     */
//   }
// });

if (command === "learn") {
  let customInterval = setInterval(function () {
    if (data.length < 10) {
      if (sample.length < 100) {
        return getWifiInfo();
      } else {
        data.push(sample);
        sample = [];
      }
    } else {
      fs.writeFile(
        `./data/${room}.json`,
        JSON.stringify(data),
        function (err, data) {
          if (err) {
            return console.log(err);
          }
        }
      );
      clearInterval(customInterval);
    }
  }, 5);
}

const predictLocation = async () => {
  let customInterval = setInterval(async function () {
    if (sample.length < 100) {
      return getWifiInfo();
    } else {
      clearInterval(customInterval);
      // const handler = tfn.io.fileSystem("./model/model.json");
      // const model = await tf.loadLayersModel(handler);

      // predict.predict(model, sample);
      predict.predict(sample);
    }
  }, 10);
};

if (command === "predict") {
  predictLocation();
}

let getWifiInfo = function () {
  wifi.getCurrentConnections(async (error, currentConnections) => {
    if (error) {
      console.log(error);
    } else {
      //   console.log(currentConnections);
      sample.push(currentConnections[0].signal_level);
    }
  });

  return sample;
};
