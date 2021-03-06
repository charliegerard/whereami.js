# whereami.js

_(Side project not intended to be used in production applications)_

Node.js module to predict indoor location using machine learning and wifi information.

_Inspired by the Python module [whereami](https://github.com/kootenpv/whereami) by [kootenpv](https://github.com/kootenpv)_

Built using [node-wifi](https://github.com/friedrith/node-wifi) and [random-forest-classifier](https://www.npmjs.com/package/random-forest-classifier)

## How to use

### Install

```javascript
npm install whereami.js
```

### Record data

In each room you'd like to use, record data by using the command `whereamijs learn <room>`.

Example:

```javascript
whereamijs learn kitchen // or -l kitchen
```

The output of running this command will be a JSON file saved in a `whereamijs-data` folder with the wifi info.

**This command takes a few seconds to get wifi data and save it**

### Predict

After recording training data with the `learn` command, run the `predict` command to get the room predicted from live data.

```javascript
whereamijs predict // or -p
```

### List rooms

You can list the rooms you already have data for, using the `rooms` or `-r` command.

```javascript
whereamijs rooms // or -r
```

## Applications

Here are some ideas of what it could be used for:

- IoT: Turn on/off lights based on which room you're in.
- Pause TV when leaving a room.
- Block notifications when in the bedroom.

## Run/develop locally

Clone this repo, `cd` into it and run `node server.js learn <room>` or `node.js server predict`.
