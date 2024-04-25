let video; let model; let isBackgroundVisible = true;
let prevHandPosition; let prevHandPositions = []; // Array to store previous positions
let gridWidth, gridHeight; let cellSize;
let gameOfLifeGrid = [];

async function setup() {
  width = 640
  height = 480
  createCanvas(width, height); 
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide(); 
  try {
    model = await handpose.load();
    // console.log("MODEL LOADED.");
    initializeGameOfLife();
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
    background(0); 
  } else {
    background(0, 0, 0, 0); 
    image(video, 0, 0, width, height); 
  }
  if (model) {
    drawGameOfLife();
    updateGameOfLife();
    detectHands();
  } else {
    setTimeout(() => {
      console.log("MODEL IS NOT LOADED!");
    }, 5000);
    
  }
  
  // ... interactWithGameOfLife(handPosition) ...
}

async function detectHands() {
  if (!model) return; 
  const predictions = await model.estimateHands(video.elt);
  if (predictions.length > 0) { 
    drawTracking(predictions); 
  } 
}


function drawTracking(predictions) { 

  // console.log("DRAW TRACKING");

  for (let i = 0; i < predictions.length; i++) { 
    const landmarks = predictions[i].landmarks;

    let smoothedPosition = calculateSmoothedPosition(landmarks, i); 
    // console.log("SMOOTHED POSITION");

    if (prevHandPositions[i]) {
      // console.log("PREV HAND POSITIONS");
      spawnLifeAroundPoint(smoothedPosition);
      // console.log("SPAWN LIFE")
    }
    
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

function spawnLifeAroundPoint(handPosition) { 
  const cellSize = width / gridWidth;  

  // Convert hand position to grid coordinates
  const gridX = Math.floor(handPosition.x / cellSize); 
  const gridY = Math.floor(handPosition.y / cellSize); 

  const clusterSize = 8; // min 2
  const aliveProbability = 0.666; // Percentage chance for a cell to be alive 

  // Iterate over the cluster area
  for (let i = -Math.floor(clusterSize / 2); i <= Math.floor(clusterSize / 2); i++) {
    for (let j = -Math.floor(clusterSize / 2); j <= Math.floor(clusterSize / 2); j++) {
      let clusterX = gridX + i;
      let clusterY = gridY + j;

       // Ensure the target grid cell is within bounds (with wrap-around)
      if (clusterX < 0) {
          clusterX = gridWidth - 1; 
      } else if (clusterX >= gridWidth) {
          clusterX = 0; 
      }

      if (clusterY < 0) {
          clusterY = gridHeight - 1; 
      } else if (clusterY >= gridHeight) {
          clusterY = 0; 
      }

      // Randomly set the cell to alive
      if (Math.random() < aliveProbability) {
        gameOfLifeGrid[clusterX][clusterY] = 1; 
        // fill(255, 0, 255); 
        rect(clusterX * cellSize, clusterY * cellSize, cellSize, cellSize); 
      }
    }
  }
}

function initializeGameOfLife() {
  // console.log("initializeGameOfLife called");

  gridWidth = 320; 
  gridHeight = 240;
  cellSize = width / gridWidth;

  gameOfLifeGrid = [];

  // Initialize grid (all cells initially dead)
  // console.log("Grid initial state:");
  for (let i = 0; i < gridWidth; i++) {
    // let rowLog = "Row " + i + ": ";
    gameOfLifeGrid[i] = []; 
    for (let j = 0; j < gridHeight; j++) {
      gameOfLifeGrid[i][j] = 0; // All cells start dead
      // rowLog += gameOfLifeGrid[i][j] + ", ";
    }
    // console.log(rowLog)
  }
}

function updateGameOfLife() {
  const nextGrid = []; // Create a temporary grid to store the next state
  // console.log("updateGameOfLife called");

  for (let i = 0; i < gridWidth; i++) {
    nextGrid[i] = [];
    for (let j = 0; j < gridHeight; j++) {
      const state = gameOfLifeGrid[i][j];
      let liveNeighbors = countLiveNeighbors(i, j);
      // console.log("Cell:", i, j, "State:", state, "Neighbors:", liveNeighbors);
      
     // Apply the Game of Life rules:
     if (state === 0 && liveNeighbors === 3) {
       nextGrid[i][j] = 1; // Reproduction
     } else if (state === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
       nextGrid[i][j] = 0; // Underpopulation or Overpopulation
     } else {
       nextGrid[i][j] = state; // Stasis
     }
   }
  }

  gameOfLifeGrid = nextGrid; // Update the main grid
}

function countLiveNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let neighborX = x + i;
      let neighborY = y + j;

      // Check grid boundaries (using wrap-around):
      // console.log("Live Neighbor BEFORE WRAP Count:", count, "X:", neighborX, "Y:", neighborY);

      if (neighborX < 0) {
          neighborX = gridWidth - 1; // Wrap to the right edge
      } else if (neighborX >= gridWidth) {
          neighborX = 0; // Wrap to the left edge
      }

      if (neighborY < 0) {
          neighborY = gridHeight - 1; // Wrap to the bottom edge
      } else if (neighborY >= gridHeight) {
          neighborY = 0; // Wrap to the top edge
      }

      // Skip checking the cell itself
      if (i !== 0 || j !== 0) {
        count += gameOfLifeGrid[neighborX][neighborY];
        //  console.log("Live Neighbor AFTER WRAP Count:", count, "X:", neighborX, "Y:", neighborY);
      }
    }
  }
  return count;
}


function drawGameOfLife() {
  // console.log("drawGameOfLife called");
  // Draw grid lines
  // noFill();
  // stroke(100); // Gray color
  // for (let i = 0; i <= gridWidth; i++) { // Use <= to draw the last line
  //   line(i * cellSize, 0, i * cellSize, height);
  // }
  // for (let j = 0; j <= gridHeight; j++) { // Use <= to draw the last line
  //   line(0, j * cellSize, width, j * cellSize);  
  // }

  // Draw cells
  noFill();
  stroke(100); // Gray color for the grid
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
       if (gameOfLifeGrid[i][j] == 1) {
         fill(255); // White cells
         rect(i * cellSize, j * cellSize, cellSize, cellSize); 
       }
    }
  }
}