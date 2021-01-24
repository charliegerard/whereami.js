const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const util = require("util");
const classes = [];
let labels = [];
let features = [];

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const shuffle = (obj1, obj2) => {
  var index = obj1.length;
  var rnd, tmp1, tmp2;

  while (index) {
    rnd = Math.floor(Math.random() * index);
    index -= 1;
    tmp1 = obj1[index];
    tmp2 = obj2[index];
    obj1[index] = obj1[rnd];
    obj2[index] = obj2[rnd];
    obj1[rnd] = tmp1;
    obj2[rnd] = tmp2;
  }
};

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

const splitData = (features, labels) => {
  shuffle(features, labels);

  let trainingFeatures = features.slice(0, (features.length * 80) / 100);
  let testFeatures = features.slice(trainingFeatures.length, features.length);
  let trainingLabels = labels.slice(0, (labels.length * 80) / 100);
  let testLabels = labels.slice(trainingLabels.length, labels.length);

  return { trainingFeatures, testFeatures, trainingLabels, testLabels };
  // return { trainingFeatures: features, trainingLabels: labels };
};

const transformToTensors = (splittedData) => {
  const {
    trainingFeatures,
    testFeatures,
    trainingLabels,
    testLabels,
  } = splittedData;

  const trainingFeaturesTensor = tf.tensor2d(trainingFeatures, [
    trainingFeatures.length,
    trainingFeatures[0].length,
  ]);

  const testFeaturesTensor = tf.tensor2d(testFeatures, [
    testFeatures.length,
    testFeatures[0].length,
  ]);

  const trainingLabelsTensor = tf.oneHot(
    tf.tensor1d(trainingLabels).toInt(),
    classes.length
  );

  const testLabelsTensor = tf.oneHot(
    tf.tensor1d(testLabels).toInt(),
    classes.length
  );

  // const trainingFeaturesTensor = tf.tensor2d(trainingFeatures, [
  //   trainingFeatures.length,
  //   trainingFeatures[0].length,
  // ]);

  // const trainingLabelsTensor = tf.oneHot(
  //   tf.tensor1d(trainingLabels).toInt(),
  //   classes.length
  // );

  return {
    trainingFeaturesTensor,
    testFeaturesTensor,
    trainingLabelsTensor,
    testLabelsTensor,
  };
};

const createModel = async (tensors) => {
  const params = { learningRate: 0.1, epochs: 60 };
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 10,
      activation: "sigmoid",
      inputShape: [tensors.trainingFeaturesTensor.shape[1]],
    })
  );

  // units = numClasses
  model.add(tf.layers.dense({ units: classes.length, activation: "softmax" }));
  const optimizer = tf.train.adam(params.learningRate);
  model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(
    tensors.trainingFeaturesTensor,
    tensors.trainingLabelsTensor,
    {
      epochs: params.epochs,
      validationData: [tensors.testFeaturesTensor, tensors.testLabelsTensor],
      shuffle: true,
      // callbacks: { onBatchEnd },
    }
  );
  await model.save("file://model");
  return model;
};

const init = async () => {
  const allData = await getData();
  allData.map((data) => features.push(JSON.parse(data)));

  classes.map((c, i) => features[0].map((s) => labels.push(i)));
  features = features.flat();

  // const splittedData = splitData(features, labels);
  const splittedData = splitData(features, labels);
  const tensors = transformToTensors(splittedData);
  const model = createModel(tensors);
};
init();
