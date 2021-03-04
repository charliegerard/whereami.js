const labels = [];
const features = [];
const data = [];
const recordButton = document.getElementsByClassName("record")[0];
const predictButton = document.getElementsByClassName("predict")[0];
const trainingSamplesSection = document.querySelector(".training-samples");
const predictionOutput = document.querySelector(".prediction-output");
const sampleLabel = document.getElementsByClassName("label")[0].value;

const record = (label) => {
  if (label) {
    recordButton.disabled = true;
    recordButton.innerText = "Recording...";
    recordButton.classList.add("loading");
    return fetch("/.netlify/functions/record", {
      method: "POST",
      body: JSON.stringify({ label }),
    })
      .then((response) => response.json())
      .then((data) => {
        recordButton.disabled = false;
        recordButton.innerText = "Record";
        recordButton.classList.remove("loading");
        document.getElementsByClassName("label")[0].value = "";
        if (localStorage.getItem("whereamijs")) {
          let locationData = localStorage.getItem("whereamijs");
          let locationDataArray = JSON.parse(locationData);
          locationData = locationDataArray.push(data);
          localStorage.setItem("whereamijs", JSON.stringify(locationDataArray));
        } else {
          localStorage.setItem("whereamijs", JSON.stringify([data]));
        }

        // display new location trained
        const dataP = document.createElement("p");
        dataP.innerText = data.label;
        trainingSamplesSection.appendChild(dataP);
      });
  }
};

const predict = () => {
  predictButton.disabled = true;
  predictButton.innerText = "Predicting...";
  predictButton.classList.add("loading");

  let trainingData;

  if (localStorage.getItem("whereamijs")) {
    trainingData = localStorage.getItem("whereamijs");
    return fetch("/.netlify/functions/predict", {
      method: "POST",
      body: JSON.stringify({ trainingData }),
    })
      .then((response) => response.json())
      .then((data) => {
        predictButton.disabled = false;
        predictButton.innerText = "Predict";
        predictButton.classList.remove("loading");
        predictionOutput.innerText = `Location predicted: ${data}`;
        predictionOutput.style.display = "block";
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
};

predictButton.onclick = () => {
  predict();
};

window.addEventListener("beforeunload", function (event) {
  if (localStorage.getItem("whereamijs")) {
    // localStorage.removeItem("whereamijs");
  }
});

const displayLocationsTrained = () => {
  if (localStorage.getItem("whereamijs")) {
    const dataStored = JSON.parse(localStorage.getItem("whereamijs"));
    const sectionTitle = document.querySelector(".training-samples h3");
    sectionTitle.innerText = "Locations trained";

    dataStored.map((d) => {
      const data = document.createElement("p");
      data.innerText = d.label;
      trainingSamplesSection.appendChild(data);
      trainingSamplesSection.style.display = "block";
    });
  } else {
    const sectionTitle = document.querySelector(".training-samples h3");
    sectionTitle.innerText = "No location trained";
  }
};

window.onload = () => {
  displayLocationsTrained();
};
