const fs = require("fs"),
  RandomForestClassifier = require("random-forest-classifier")
    .RandomForestClassifier;

const util = require("util");
let labels = [];
let features = [];
let classes = [];
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

var rf = new RandomForestClassifier({
  n_estimators: 10,
});

// Get training data from JSON files
const getData = async () => {
  let names;
  try {
    names = await readdir(`./data`);
  } catch (err) {
    console.log(err);
  }
  if (names === undefined) {
    console.log("undefined");
  }
  return Promise.all(
    names.map(async (name) => {
      classes.push(name.split(".")[0]);
      return await readFile(`./data/${name}`);
    })
  );
};

let networks = [];

const predict = async (liveData) => {
  const allData = await getData();
  allData.map((data) => {
    const arrayData = JSON.parse(data);
    features.push(arrayData);
  });

  classes.map((c, i) => features[0].map((s) => labels.push(i)));
  features = features.flat();

  // For each network in the training data, network names might not all be the same as networks are not constant.
  // To make sure we optimise the prediction, we look at the networks in the live data and compare it to our training set
  // to only keep the values present in all objects.
  const liveDataNetworks = Object.keys(liveData[0]);
  const trainingDataNetworks = features.map((feature) =>
    Object.keys(feature).filter((element) => liveDataNetworks.includes(element))
  );

  // The array is flattened so we can extract the network names that are present in all training samples.
  // If a network name is found as many times as there are objects in the training set, we know we have enough samples to use this network.
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

  // Then, we keep the network names so we can sort them.
  const sortedNames = commonNetworks.map((t) => t[0]).sort();
  networks = sortedNames;

  // Keep only the networks values
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
  //   console.log(networksValues);
  const test = networksValues.map((network) => network[0]);

  test.map((data, i) => (data["room"] = labels[i]));

  shuffle(test);

  const dataset = test;

  //   const trainingData = test.slice(0, dataset.length - 2);
  const trainingData = test;
  //   const testData = test.slice(dataset.length - 2);
  //   console.log("before", testData);
  //   delete testData[0].room;
  //   delete testData[1].room;
  //   console.log("after", testData);

  const options = {
    seed: 3,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: 25,
  };

  const formattedLiveData = formatLiveData(liveData);
  //   console.log(trainingData);
  //   console.log(formattedLiveData);

  rf.fit(trainingData, null, "room", function (err, trees) {
    //console.log(JSON.stringify(trees, null, 4));
    var pred = rf.predict([formattedLiveData], trees);

    console.log("pred index", pred);
    console.log("prediction", classes[pred[0]]);
    // pred = ["virginica", "setosa"]
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

module.exports = predict;
