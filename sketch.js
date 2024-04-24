// import * as handpose from '@tensorflow-models/handpose';
// sudo npm install -g @tensorflow-models/handpose

let video;
let model; // Placeholder for your Handpose model
let isBackgroundVisible = true;

let prevHandPosition;
let prevHandPositions = []; // Array to store previous positions


// const colors = [
//   { h: 255, s: 0, b: 255 },   // Magenta
//   { h: 30, s: 255, b: 0 }      // Orange
// ];

async function setup() {
  createCanvas(640, 480); 
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide(); 

  // Step 1: Attempt to load Handpose Model
  try {
    // Attempt to load the handpose model
    model = await handpose.load();
    console.log("Model loaded.");
  } catch (error) {
    console.error("Error loading model:", error);
  }

  document.getElementById('toggleButton').addEventListener('click', toggleBackground);
}

function videoReady() {
  console.log("Video stream ready!");
}

function toggleBackground() {
  isBackgroundVisible = !isBackgroundVisible;
}

function draw() {
  if (isBackgroundVisible) {
    background(0); // Black background
  } else {
    // Transparent background with video feed
    background(0, 0, 0, 0); 
    image(video, 0, 0, width, height); 
  }

  // Step 3: Only attempt hand tracking if model is loaded
  if (model) {
    detectHands(); // Call your hand detection function
  } else {
    console.log("MODEL IS NOT LOADED")
  }
}

async function detectHands() {
  if (!model) return; 

  const predictions = await model.estimateHands(video.elt);

  if (predictions.length > 0) { 
    drawTracking(predictions); 
  } 
}

// // Placeholder for your drawing function
// function drawTracking(predictions) { 
//   for (const handPrediction of predictions) { // Iterate through each hand
//     for (const landmark of handPrediction.landmarks) {
//       noStroke(); 
//       fill(0, 255, 0); // Green color
//       ellipse(landmark[0], landmark[1], 5, 5);
//     }
//   }
// }


function drawTracking(predictions) { 
  for (let i = 0; i < predictions.length; i++) { 
    const landmarks = predictions[i].landmarks;

    let smoothedPosition = calculateSmoothedPosition(landmarks, i); 
    drawLandmarks(landmarks); 

    // ... (Use smoothedPosition for your dot drawing: Example)
    drawDot(smoothedPosition); 
  }
}

function calculateSmoothedPosition(landmarks, handIndex) {
  const avgX = average(landmarks.map(l => l[0]));
  const avgY = average(landmarks.map(l => l[1]));

  if (prevHandPositions[handIndex]) {
    prevHandPositions[handIndex].x = 0.8*prevHandPositions[handIndex].x + 0.2*avgX;
    prevHandPositions[handIndex].y = 0.8*prevHandPositions[handIndex].y + 0.2*avgY;
  } else {
    prevHandPositions[handIndex] = createVector(avgX, avgY);
  }

  return prevHandPositions[handIndex];
}


function drawLandmarks(landmarks) {
  for (const landmark of landmarks) {
    noStroke(); 
    fill(0, 255, 0); 
    ellipse(landmark[0], landmark[1], 5, 5);
  }
}

function drawDot(position) {
  noStroke(); // No border for the dot
  fill(255, 0, 0); // Red color
  ellipse(position.x, position.y, 10, 10); // Draw a circle 10 pixels wide
}

function average(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}
