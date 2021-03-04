# whereami.js

Node.js module to predict indoor location using machine learning and wifi information.

_Inspired by the Python module [whereami](https://github.com/kootenpv/whereami) by [kootenpv](https://github.com/kootenpv)_

Built using [node-wifi](https://github.com/friedrith/node-wifi) and [random-forest-classifier](https://www.npmjs.com/package/random-forest-classifier)

_Current working version: Node.js v14.15.2_

## How to use

### Install

```javascript
npm install whereami.js
```

### Record data

Record data in each room you'd like to be able to predict later with the `learn` command.

Example:

```javascript
whereamijs learn kitchen
```

The output of running this command will be a JSON file saved in a `data` folder with the wifi info.

### Predict

After recording training data with the `learn` command, run the `predict` command to get the room predicted from live data.

```javascript
whereamijs predict
```

## Applications

Here are some ideas of what it could be used for:

- IoT: Turn on/off lights based on which room you're in.
- Pause TV when leaving a room.
- Block notifications when in the bedroom.

### Run/develop locally

Clone this repo, `cd` into it and run `node server.js learn kitchen` or `node.js server predict`.

Then, to test the package, start by running `npm link` and then, `whereamijs predict`.
