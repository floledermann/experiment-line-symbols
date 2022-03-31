
const Dimension = require("another-dimension");

const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "parking-line",
  description: "A hollow line with dashes on each side",
  length: "50mm",
  width: "1.5mm",
  angle: -30,           // in degrees
  borderWidth: 1/9,
  dashWidth: 1/18,
  leftWidth: 8/27,       // in proportion to line width
  leftDashSpacing: 1,   // in proportion to lane width
  leftDashAngle: 45,    // in degrees
  rightWidth: 8/27,       // in proportion to line width
  rightDashSpacing: 1,   // in proportion to lane width
  rightDashAngle: 45,    // in degrees
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  dashIntensity: 0.0,
  choices: [{label: "Continue"}]
};


function renderParkingLine(ctx, condition) {

  condition = Object.assign({
  }, condition);
    
  let w = condition.width;
  let l = condition.length;
  let w2 = w/2;
  let l2 = l/2;
    
  ctx.rotate(condition.angle / 180 * Math.PI);
  
  let bw = w*condition.borderWidth;
  
  ctx.save();
  ctx.fillStyle = condition.foregroundIntensity;
  
  ctx.beginPath();
  ctx.moveTo(-l2,-w2);
  ctx.lineTo(l2,-w2);
  ctx.lineTo(l2,-w2+bw);
  ctx.lineTo(-l2,-w2+bw);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-l2,w2);
  ctx.lineTo(l2,w2);
  ctx.lineTo(l2,w2-bw);
  ctx.lineTo(-l2,w2-bw);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
  
  let dw = w * condition.dashWidth;
  let dw2 = dw/2;
  
  let tanAngle = Math.tan(condition.leftDashAngle / 180 * Math.PI);
  let lane = w * condition.leftWidth * Math.sqrt( 1 + tanAngle ** 2);
  //let gap = lane * condition.leftDashSpacing;
  // taking the sqrt of the spacing factor looks intuitively right (equal grey value)
  let gap = w * condition.leftWidth * Math.sqrt(Math.sqrt( 1 + tanAngle ** 2)) * condition.leftDashSpacing;
  
  // distribute remaining space evenly at beginning and end
  let dashPos = -l2 + gap - tanAngle * w * condition.leftWidth / 2;
    
  ctx.fillStyle = condition.dashIntensity;
  
  
  while (dashPos < l2 - gap - tanAngle * w * condition.leftWidth / 2) {
    
    ctx.save();
    
    ctx.translate(dashPos, -w2 + bw/2);
    ctx.rotate(-condition.leftDashAngle / 180 * Math.PI);
    
    ctx.beginPath();
    
    ctx.moveTo(dw2, 0);
    ctx.lineTo(dw2, lane);
    ctx.lineTo(-dw2, lane);
    ctx.lineTo(-dw2, 0);

    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    dashPos += gap;   
  }

  tanAngle = Math.tan(condition.rightDashAngle / 180 * Math.PI);
  lane = w * condition.rightWidth * Math.sqrt( 1 + tanAngle ** 2);
  //gap = lane * condition.rightDashSpacing;
  // taking the sqrt of the spacing factor looks intuitively right (equal grey value)
  gap = w * condition.rightWidth * Math.sqrt(Math.sqrt( 1 + tanAngle ** 2)) * condition.rightDashSpacing;
  
  // distribute remaining space evenly at beginning and end
  dashPos = -l2 + gap - tanAngle * w * condition.rightWidth / 2; // + gap + ((l-gap) % (al+gap)) / 2;
  
  while (dashPos < l2 - gap - tanAngle * w * condition.rightWidth / 2) {
    
    ctx.save();
    
    ctx.translate(dashPos, w2 - bw/2);
    ctx.rotate(condition.rightDashAngle / 180 * Math.PI);
    
    ctx.beginPath();
    
    ctx.moveTo(dw2, 0);
    ctx.lineTo(dw2, -lane);
    ctx.lineTo(-dw2, -lane);
    ctx.lineTo(-dw2, 0);

    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    dashPos += gap;   
  }
 
}

let renderer = config => canvasRenderer(renderParkingLine, {
  dimensions: ["length", "width"],
  intensities: ["arrowIntensity"]
});

let buttonRenderer = config => canvasRenderer(renderParkingLine, {
  dimensions: ["length", "width"],
  intensities: ["dashIntensity"],
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


