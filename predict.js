const tf = require("@tensorflow/tfjs-node");
const classes = ["couch", "kitchen", "toilets"];

const predict = (model, liveData) => {
  const input = tf.tensor2d(liveData, [1, liveData.length]);
  const predictOut = model.predict(input);
  // const logits = Array.from(predictOut.dataSync());
  const prediction = predictOut.argMax(-1).dataSync()[0];

  console.log("\x1b[43m");
  console.log("\x1b[30m", classes[prediction].toUpperCase());
  console.log("\x1b[43m");
  //   console.log("new prediction", predictOut.dataSync());
};

exports.predict = predict;
