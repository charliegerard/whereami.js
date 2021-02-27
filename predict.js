const { RandomForestClassifier } = require("ml-random-forest");
const fs = require("fs");
const util = require("util");
let labels = [];
let features = [];
let classes = [];
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

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
  const networksValues = features.map((feature) =>
    Object.keys(feature)
      .map((f) => (sortedNames.includes(f) ? feature[f] : null))
      .filter(Number)
  );

  // Push labels into features
  networksValues.map((network, index) => network.push(labels[index]));

  // If running into the issue of column indices, remember that features and labels have to be divisible by 8.
  // Current number of samples working - 4

  shuffle(networksValues);

  const dataset = networksValues;
  const trainingSet = new Array(dataset.length);
  const predictions = new Array(dataset.length);

  for (let i = 0; i < dataset.length; ++i) {
    trainingSet[i] = dataset[i].slice(0, dataset[i].length - 1);
    predictions[i] = dataset[i][dataset[i].length - 1];
  }

  const options = {
    seed: 3,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: 100,
  };

  function getAccuracy(predictions, target) {
    const nSamples = predictions.length;
    let nCorrect = 0;
    predictions.forEach((val, idx) => {
      if (val == target[idx]) {
        nCorrect++;
      }
    });
    return nCorrect / nSamples;
  }

  if (predictions) {
    const classifier = new RandomForestClassifier(options);
    classifier.train(trainingSet, predictions);
    const liveDataFormatted = formatLiveData(liveData);

    const result = classifier.predict([liveDataFormatted]);
    console.log(classes[result[0]]);
    console.log(`Accuracy: ${getAccuracy(result, predictions)}`); // Accuracy: 0.74
  }
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
      if (networks.includes(network)) {
        return sortedData[network];
      }
    })
    .filter(Number);

  return values;
};

module.exports = predict;
