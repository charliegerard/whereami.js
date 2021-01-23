# whereami.js

Node.js module to predict indoor location using machine learning and wifi information.

_Inspired by the Python module [whereami](https://github.com/kootenpv/whereami) by [kootenpv](https://github.com/kootenpv)_

Built using [node-wifi](https://github.com/friedrith/node-wifi) and [TensorFlow.js](https://github.com/tensorflow/tfjs/tree/master/tfjs-node)

_Current working version: Node.js v14.15.2_

## How to use

### Install

```javascript
npm install whereami.js
```

### Record data

Example:

```javascript
whereami learn kitchen
```

### Train

```javascript
node train.js
```

### Predict

```javascript
whereami predict
```

## Applications

Here are some ideas of what it could be used for:

- IoT: Turn on/off lights based on which room you're in.
- Pause TV when leaving a room.
- Block notifications when in the bedroom.
