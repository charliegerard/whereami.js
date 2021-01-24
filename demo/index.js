const init = () => {
  fetch("/.netlify/functions/ml").then((response) => console.log(response));
};

// init();

const labels = [];
const features = [];
const data = [];

const recordButton = document.getElementsByClassName("record")[0];

recordButton.onclick = (e) => {
  const sampleLabel = document.getElementsByClassName("label")[0].value;
  labels.push(sampleLabel);
  // set button to disabled state to avoid recording twice

  // fetch wifi info from function

  //   while(wifiData < 1000){
  //     data.push(wifiData)
  //   }
  //   features.push(data);
};
