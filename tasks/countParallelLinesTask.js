
const Dimension = require("another-dimension");

const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "count-lines",
  description: "Count the number of parallel lines.",
  length: "50mm",
  angle: -30,           // in degrees
  width: "0.5mm",
  gap: "1mm",
  numLines: 7,
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  choices: [{label: "Continue"}]
};

let dimensionKeys = ["length","width","gap"];


function renderParallelLines(ctx, condition) {

  condition = Object.assign({
  }, condition);
  
  let c = condition;
  
  ctx.rotate(c.angle * Math.PI / 180);
  ctx.translate(0, -c.gap * (c.numCandidates-1) - c.width * c.numCandidates / 2);
  ctx.lineWidth = c.width;
  
  for (let i=0; i<c.numLines; i++) {
    
    ctx.beginPath();
    ctx.moveTo(-c.length / 2, 0);
    ctx.lineTo(c.length / 2, 0);
    ctx.stroke();
    
    ctx.translate(0, c.gap + c.width);
  }
 
}



let renderer = config => canvasRenderer(renderParallelLines, {
  dimensions: dimensionKeys,
  intensities: ["arrowIntensity"]
});

let buttonRenderer = config => canvasRenderer(renderParallelLines, {
  dimensions: dimensionKeys,
  // make sure to specify width and height of the canvas in pixels
  width: 100,
  height: 50,
  // each condition received can be adapted to the button by overriding some of its properties
  overrideCondition: config.buttonCondition || {
    length: "20mm",
    width: "2mm"
  }
});

let buttons = config => htmlButtons({
  buttons: condition => condition.choices.map(
    choice => ({
      label: choice.label,
      response: choice.response || choice,
      subUI: buttonRenderer(config)
    })
  )
});


const task = simpleTask({
  defaults: DEFAULTS, 
  // The interfaces the task provides.
  // These can be remapped by the user with the "<interfaceName>Interface" configuration properties.
  interfaces: {
    display: renderer,
    monitor: renderer,
    response: buttons,
  },
});

task.renderer = renderer();

module.exports = task;


