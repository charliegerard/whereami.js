const wifi = require("node-wifi");
const RandomForestClassifier = require("random-forest-classifier")
  .RandomForestClassifier;

const sampleData = [];
let data = [];
let sample = [];
let labels = [];
let features = [];
let classes = [];

var rf = new RandomForestClassifier({
  n_estimators: 10,
});

wifi.init({
  iface: null, // network interface, choose a random wifi interface if set to null
});

const predictLocation = () => {
  return new Promise((resolve) => {
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
      resolve(sample);
    });
  });
};

const predict = async (liveData, formattedTrainingData) => {
  formattedTrainingData.map((data) => {
    // const arrayData = JSON.parse(data);
    const arrayData = data.data;
    classes.push(data.label);
    features.push(arrayData);
  });

  classes.map((c, i) => features[0].map((s) => labels.push(i)));
  features = features.flat();

  /* 
    For each network in the training data, network names might not all be the same as networks are not constant.
    To make sure we optimise the prediction, we look at the networks in the live data and compare it to our training set
    to only keep the values present in all objects. 
  */
  const liveDataNetworks = Object.keys(liveData[0]);
  const trainingDataNetworks = features.map((feature) =>
    Object.keys(feature).filter((element) => liveDataNetworks.includes(element))
  );

  /*
    The array is flattened so we can extract the network names that are present in all training samples.
    If a network name is found as many times as there are objects in the training set, we know this network was 
    found every time we sampled wifi data so we should keep it.
  */
  var networksOccurences = trainingDataNetworks
    .flat()
    .reduce(function (acc, curr) {
      if (typeof acc[curr] == "undefined") {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});

  const commonNetworks = Object.entries(networksOccurences).filter(
    (entry) => entry[1] === trainingDataNetworks.length
  );

  // Sort network names aphabetically so we can be sure all data will be used in the same order.
  const sortedNames = commonNetworks.map((t) => t[0]).sort();
  networks = sortedNames;

  // Keep networks objects
  const networksValues = features.map((feature) => {
    const test = {};
    return Object.keys(feature)
      .sort()
      .map((f, i) => {
        if (sortedNames.includes(f)) {
          const key = f;
          const value = feature[f];
          test[key] = value;
          return test;
        }
      })
      .filter(Boolean);
  });
  // Weirdly, the array outputs too many objects so we just keep the 1st one
  const outputNetworksData = networksValues.map((network) => network[0]);

  // Insert the room as a key/value pair in each object
  outputNetworksData.map((data, i) => (data["room"] = labels[i]));

  // Shuffle the data so we don't have any overfitting
  shuffle(outputNetworksData);

  const trainingData = outputNetworksData;

  // Format the live data the same way as the training data
  const formattedLiveData = formatLiveData(liveData);

  // Fit the random forest classifier and predict
  return new Promise((resolve, reject) => {
    rf.fit(trainingData, null, "room", function (err, trees) {
      //console.log(JSON.stringify(trees, null, 4));
      var pred = rf.predict([formattedLiveData], trees);

      // console.log("pred index", pred);
      // console.log("prediction", classes[pred[0]]);
      resolve(classes[pred[0]]);
    });
  });
};

const shuffle = (array) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const formatLiveData = (data) => {
  // Sort live data by network name
  const sortedData = Object.keys(data[0])
    .sort()
    .reduce((obj, key) => {
      obj[key] = data[0][key];
      return obj;
    }, {});

  // Keep only the same networks as the ones found in the training data and return the values
  const values = Object.keys(sortedData)
    .map((network) => {
      const netObject = {};
      if (networks.includes(network)) {
        const key = network;
        const value = sortedData[key];
        netObject[key] = value;
        return netObject;
      }
    })
    .filter(Boolean);

  let merged = Object.assign(...values);

  return merged;
};

exports.handler = async function (event, context) {
  const { trainingData } = JSON.parse(event.body);
  let formattedTrainingData = JSON.parse(trainingData);
  const liveData = await predictLocation(formattedTrainingData);
  const prediction = await predict(liveData, formattedTrainingData);

  return {
    statusCode: 200,
    body: JSON.stringify(prediction),
  };
};
