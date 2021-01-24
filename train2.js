const { RandomForestClassifier } = require("ml-random-forest");
const fs = require("fs");
const util = require("util");
const classes = [];
let labels = [];
let features = [];

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

async function getData() {
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
      // let room = name.split(".")[0];
      classes.push(name.split(".")[0]);
      // labels.push(classes.indexOf(room));
      return await readFile(`./data/${name}`);
    })
  );
}

const init = async () => {
  const allData = await getData();
  allData.map((data) => features.push(JSON.parse(data)));

  classes.map((c, i) => features[0].map((s) => labels.push(i)));
  features = features.flat();

  const truncatedFeatures = features.map((d) => d.slice(0, 100));

  const trainingSet = truncatedFeatures;
  const predictions = labels;

  const options = {
    seed: 3,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: 25,
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

    const result = classifier.predict(trainingSet);
    // const result = classifier.predict([]);
    // console.log(result);

    console.log(`Accuracy: ${getAccuracy(result, predictions)}`); // Accuracy: 0.74
  }
};

init();
