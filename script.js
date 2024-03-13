const paper = document.querySelector("#paper");
const pen = paper.getContext("2d");
const arcColors = ['#ed7bef', '#e47ef3', '#db82f6', '#d285f9', '#c888fc', '#be8afd', '#b48dff', '#aa8fff', '#a091ff', '#9693ff', '#8c95fe', '#8197fc', '#7798fa', '#6d99f8', '#639af5', '#589bf2', '#4e9cee', '#459cea', '#3b9de6', '#319de1', '#289ddc'];
const startTime = new Date().getTime(); // Time when page loads
let soundEnabled = false;

// Time in milliseconds
const calculateNextImpactTime = (currentImpactTime, velocity) => {
    return currentImpactTime + ((Math.PI / velocity) * 1000);
}

const arcs = arcColors.map((color, index) => {
    const audio = new Audio(`./assets/key-wave-${index}.wav`);
    audio.volume = 0.02;

    // Duration 30 Seconds, First dot will do 1 lap, second one will do 2, etc.
    // The '1' can be changed to whatever to create more laps for each dot
    // Dot's will always get to start in sync after 30 seconds
    const resetTime = 60;
    const velocity = (2 * Math.PI * (index + 10)) / resetTime;

    return {
        color,
        audio,
        nextImpactTime: calculateNextImpactTime(startTime, velocity),
        velocity
    }
})

// Disable sound anytime window is minimized
document.onvisibilitychange = () => soundEnabled = false;

// Enable sound when window is clicked into
document.onclick = () => soundEnabled = !soundEnabled;

const draw = () => {
  
  // Logic for keeping track of how much time has passed
  const currentTime = new Date().getTime()
  const elapsedTime = (currentTime - startTime) / 1000; // By default it's in mili-seconds
  
  // Canvas doesn't know that the width has been edited by CSS, so we update it
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;
  
  /** DRAW LINE **/
  
  // Line Start
  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9
  }
  
  // Line End
  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9
  }
  
  // Line Details
  pen.strokeStyle = "white";
  pen.lineWidth = 4;
  
  // Specify directions for Line
  pen.beginPath();
  pen.moveTo(start.x, start.y);
  pen.lineTo(end.x, end.y);
  
  // Create line on screen
  pen.stroke();
  
  arcs.forEach((arc, index) => {
    
    // DRAW ARC

    // Arc center coordinates
    const center = {
      x: paper.width * 0.5,
      y: paper.height * 0.9
    }

    const lineLength = end.x - start.x;
    const smallRadius = lineLength * 0.05;
    const distBetweenSmallestBiggestArcs = (lineLength / 2) - smallRadius;
    const arcRadius = (distBetweenSmallestBiggestArcs * (index / arcs.length)) + smallRadius; 
    
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;

    // Specify directions for Arc
    pen.beginPath();
    pen.strokeStyle = arc.color;
    // Needs center, radius length, and start/end angles
    pen.arc(center.x, 
            center.y, 
            arcRadius, // Radius
            startAngle, // Start Angle
            endAngle, // End Angle
          );

    // Draw Arc
    pen.stroke();


    // DRAW DOTS 


    // Location on arc circumference
    const distance = (Math.PI + (elapsedTime * arc.velocity));
    const maxAngle = 2 * Math.PI;
    const modDistance = distance % maxAngle;
    const finalDistance = modDistance >= Math.PI ? modDistance : maxAngle - modDistance;

    // Dot Position
    const dotCoords = {
      x: arcRadius * Math.cos(finalDistance) + center.x,
      y: arcRadius * Math.sin(finalDistance) + center.y
    }

    // Fill in dots
    pen.fillStyle = "white";

    pen.beginPath();
    pen.arc(dotCoords.x, dotCoords.y, lineLength * 0.009, 0, 2 * Math.PI);

    // Draw Dot
    pen.fill();


    // PLAY SOUND

    if (currentTime >= arc.nextImpactTime) {
      if (soundEnabled) {
        arc.audio.play();
        arc.audio.currentTime = 0;
      }

      arc.nextImpactTime = calculateNextImpactTime(arc.nextImpactTime, arc.velocity);
    }
  })
  
  // A recursive call to this functions means that the animation is continuously animated (requestAnimationFrame runs the callback function)
  // The rate of this animations is roughly the refresh rate of the monitor
  requestAnimationFrame(draw);
}

draw();