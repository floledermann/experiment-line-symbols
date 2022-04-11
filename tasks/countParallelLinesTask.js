
const Dimension = require("another-dimension");

const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "count-lines",
  description: "Count the number of parallel lines.",
  length: "60mm",
  angle: -30,           // in degrees
  lineWidth: "0.15mm",
  gap: "1.25mm",
  numLines: 9,
  blurRadius: 0.4,
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  choices: [{label: "Continue"}]
};

let dimensionKeys = ["length","lineWidth","gap"];


function renderParallelLines(ctx, condition) {

  condition = Object.assign({
  }, condition);
  
  let c = condition;
  
  ctx.rotate(c.angle * Math.PI / 180);
  ctx.lineWidth = c.lineWidth;
  
  ctx.fillStyle = condition.foregroundIntensity;
  ctx.strokeStyle = condition.foregroundIntensity;
  
  if (c.blurRadius) {
    let color = parseColor(c.foregroundIntensity);
    let colorStr = "rgba(" + color[0] + "," + color[1] + "," + color[2];
    let gradient = ctx.createLinearGradient(-c.length / 2, 0, c.length / 2, 0);
    gradient.addColorStop(0, colorStr + ",0)");
    gradient.addColorStop(c.blurRadius, colorStr + ",1)");
    gradient.addColorStop(1-c.blurRadius, colorStr + ",1)");
    gradient.addColorStop(1, colorStr + ",0)");
    ctx.strokeStyle = gradient;
  }
  
  ctx.save();

  ctx.translate(0, -(c.gap + c.lineWidth) * (c.numLines-1) / 2);
  
  for (let i=0; i<c.numLines; i++) {
    
    ctx.beginPath();
    ctx.moveTo(-c.length / 2, 0);
    ctx.lineTo(c.length / 2, 0);
    ctx.stroke();
    
    ctx.translate(0, c.gap + c.lineWidth);
  }
  
  ctx.restore();
  
  //ctx.fillStyle = "#7f7f7f";
  //ctx.fillRect(-c.length / 2 - 20, -50, 60, 100);
  
}

function parseColor(str) {
  
  let c;
  
  c = str.match(/^#([0-9a-f]{6})$/i);
  if(c) {
      return [
          parseInt(c[1].substr(0,2),16),
          parseInt(c[1].substr(2,2),16),
          parseInt(c[1].substr(4,2),16)
      ];
  }
  
  c = str.match(/^#([0-9a-f]{8})$/i);
  if(c) {
      return [
          parseInt(c[1].substr(0,2),16),
          parseInt(c[1].substr(2,2),16),
          parseInt(c[1].substr(4,2),16),
          parseInt(c[1].substr(6,2),16)
      ];
  }

  c = str.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if(c) {
      return [+c[1],+c[2],+c[3]];
  } 

  c = str.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if(c) {
      return [+c[1],+c[2],+c[3],+c[4]];
  } 

  return null;
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


