const tf = require("@tensorflow/tfjs-node");
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
      let room = name.split(".")[0];
      classes.push(name.split(".")[0]);
      labels.push(classes.indexOf(room));
      return await readFile(`./data/${name}`);
    })
  );
}

const transformToTensors = (features, labels) => {
  console.log(features);
  const featuresTensor = tf.tensor2d(features, [
    features.length,
    features[0].length,
  ]);

  const labelsTensor = tf.oneHot(tf.tensor1d(labels).toInt(), 2);

  return {
    featuresTensor,
    labelsTensor,
  };
};

const createModel = async (tensors) => {
  const params = { learningRate: 0.1, epochs: 40 };
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 10,
      activation: "sigmoid",
      inputShape: [tensors.featuresTensor.shape[1]],
    })
  );
  // units = numClasses
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));
  const optimizer = tf.train.adam(params.learningRate);
  model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(tensors.featuresTensor, tensors.labelsTensor, {
    epochs: params.epochs,
    // validationData: [
    //   tensors.testingFeaturesTensor,
    //   tensors.testingLabelsTensor,
    // ],
    shuffle: true,
    // callbacks: { onBatchEnd },
  });
  await model.save("file://model");
  return model;
};

const init = async () => {
  const allData = await getData();
  allData.map((data) => features.push(JSON.parse(data)));

  const tensors = transformToTensors(features, labels);
  const model = createModel(tensors);
};
init();
