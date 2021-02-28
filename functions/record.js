const wifi = require("node-wifi");
let sample = [];

wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

const getNetworks = async (label) => {
  return new Promise((resolve) => {
    const getInfo = (resolve, label) => {
      wifi.scan((error, networks) => {
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
        if (sample.length < 2) {
          getInfo(resolve, label);
        } else {
          resolve({ label: label, data: sample });
        }
      });
    };
    return getInfo(resolve, label);
  });
};

exports.handler = async function (event, context) {
  const { label } = JSON.parse(event.body);
  const data = await getNetworks(label);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
