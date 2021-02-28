const labels = [];
const features = [];
const data = [];
const recordButton = document.getElementsByClassName("record")[0];
const predictButton = document.getElementsByClassName("predict")[0];
const state = document.querySelector("h3");

const record = (label) => {
  state.innerText = "RECORDING...";
  recordButton.disabled = true;
  return fetch("/.netlify/functions/record", {
    method: "POST",
    body: JSON.stringify({ label }),
  })
    .then((response) => response.json())
    .then((data) => {
      state.innerText = "FINISHED";
      recordButton.disabled = false;
      if (localStorage.getItem("whereamijs")) {
        let locationData = localStorage.getItem("whereamijs");
        let locationDataArray = JSON.parse(locationData);
        locationData = locationDataArray.push(data);
        localStorage.setItem("whereamijs", JSON.stringify(locationDataArray));
      } else {
        localStorage.setItem("whereamijs", JSON.stringify([data]));
      }
    });
};

const predict = () => {
  predictButton.disabled = true;
  let trainingData;

  if (localStorage.getItem("whereamijs")) {
    trainingData = localStorage.getItem("whereamijs");

    return fetch("/.netlify/functions/predict", {
      method: "POST",
      body: JSON.stringify({ trainingData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("PREDICT DATA", data);
        state.innerText = data;
        predictButton.disabled = false;
      })
      .catch((e) => {
        console.log("Error", e);
      });
  } else {
    throw new Error("you need to record data first");
  }
};

recordButton.onclick = () => {
  const sampleLabel = document.getElementsByClassName("label")[0].value;
  labels.push(sampleLabel);

  record(sampleLabel);
  // set button to disabled state to avoid recording twice
};

predictButton.onclick = () => {
  predict();
};

window.addEventListener("beforeunload", function (event) {
  if (localStorage.getItem("whereamijs")) {
    // localStorage.removeItem("whereamijs");
  }
});
