# whereami.js

Inspired by the Python module [whereami](https://github.com/kootenpv/whereami) by [kootenpv](https://github.com/kootenpv)

Built using [node-wifi](https://github.com/friedrith/node-wifi) and [TensorFlow.js](https://github.com/tensorflow/tfjs/tree/master/tfjs-node)

Node.js module to predict indoor location using machine learning and wifi information.

## How to use

### Install

```javascript
npm install whereami.js
```

### Record data

Example:

```javascript
node server.js learn kitchen
```

### Train

```javascript
node train.js
```

### Predict

```javascript
node predict.js
```
