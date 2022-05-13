
const Dimension = require("another-dimension");

const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "arrow-line",
  description: "A line with embedded arrows",
  length: "50mm",
  width: "1.5mm",
  angle: -30,         // in degrees
  arrowWidth: 2/3,    // in proportion to line width
  arrowLength: 2,     // in proportion to arrow width
  gapLength: 1,       // in proportion to arrow length
  letterSize: "6mm",
  letterGap: "6mm",
  letterWeight: "bold",
  cornerDots: false,
  alignCornerDots: false,
  reverse: false,
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  arrowIntensity: 1.0,
  choices: [{label: "Continue"}]
};


function renderArrowLine(ctx, condition) {

  condition = Object.assign({
  }, condition);
  
  let c = condition;
    
  let w = condition.width;
  let l = condition.length;
  let w2 = w/2;
  let l2 = l/2;
    
  ctx.rotate(condition.angle / 180 * Math.PI);
  
  ctx.fillStyle = condition.foregroundIntensity;
  
  if (c.letterSize > 0) {
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = c.letterWeight + " " + c.letterSize + "px sans-serif";

    ctx.save();
    ctx.translate(-l2 - c.letterGap, 0);
    ctx.rotate(-condition.angle / 180 * Math.PI);
    ctx.fillText("A", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(l2 + c.letterGap, 0);
    ctx.rotate(-condition.angle / 180 * Math.PI);
    ctx.fillText("B", 0, 0);
    ctx.restore();
  }
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-l2,-w2);
  ctx.lineTo(l2,-w2);
  ctx.lineTo(l2,w2);
  ctx.lineTo(-l2,w2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  let aw = w * condition.arrowWidth;
  let aw2 = aw/2;
  let al = aw * condition.arrowLength;
  let gap = al * condition.gapLength;
  // distribute remaining space evenly at beginning and end
  let arrowPos = -l2 + gap + ((l-gap) % (al+gap)) / 2;
  
  ctx.fillStyle = condition.arrowIntensity;
  
  while (arrowPos < l2-al-gap) {
        
    ctx.beginPath();
    if (condition.reverse) {
      ctx.moveTo(arrowPos, 0);
      ctx.lineTo(arrowPos + al, -aw2);
      ctx.lineTo(arrowPos + al, aw2);
    }
    else {
      ctx.moveTo(arrowPos, -aw2);
      ctx.lineTo(arrowPos + al, 0);
      ctx.lineTo(arrowPos, aw2);
    }
    ctx.closePath();
    ctx.fill();
    
    if (condition.cornerDots) {
      
      ctx.save();
      ctx.fillStyle = "#00ff00";
       
      if (!condition.alignCornerDots) {
        
        let cpos = arrowPos + (condition.reverse ? 1 : al-1);
        ctx.beginPath();
        ctx.arc(cpos, 0, 0.55, 0, 2 * Math.PI, false);
        ctx.fill();
        
        cpos = arrowPos + (condition.reverse ? al : 0);
        ctx.beginPath();
        ctx.arc(cpos, aw2, 0.55, 0, 2 * Math.PI, false);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cpos, -aw2, 0.55, 0, 2 * Math.PI, false);
        ctx.fill();
        
      }
      else {
        
        // pixel-align corner dots
        // calculate inverse transformation and round to full pixel value
        
        ctx.save();
        let cpos = arrowPos + (condition.reverse ? 1 : al-1);
        ctx.translate(cpos, 0);
        let m = ctx.getTransform();
        let p = new DOMPoint(0,0);
        p = p.matrixTransform(m);
        ctx.resetTransform();
        ctx.fillRect(Math.round(p.x-0.5), Math.round(p.y-0.5), 1, 1);
        ctx.restore();
       
        ctx.save();
        cpos = arrowPos + (condition.reverse ? al : 0);
        ctx.translate(cpos, -aw2+0.2);
        m = ctx.getTransform();
        p = new DOMPoint(0,0);
        p = p.matrixTransform(m);
        ctx.resetTransform();
        ctx.fillRect(Math.round(p.x-0.5), Math.round(p.y-0.5), 1, 1);
        ctx.restore();
        
        ctx.save();
        cpos = arrowPos + (condition.reverse ? al : 0);
        ctx.translate(cpos, aw2-0.2);
        m = ctx.getTransform();
        p = new DOMPoint(0,0);
        p = p.matrixTransform(m);
        ctx.resetTransform();
        ctx.fillRect(Math.round(p.x-0.5), Math.round(p.y-0.5), 1, 1);
        ctx.restore();
      }
      
      ctx.restore();
    }
    
    arrowPos += al + gap;   
  }
 
}

let renderer = config => canvasRenderer(renderArrowLine, {
  dimensions: ["length", "width", "letterSize", "letterGap"],
  intensities: ["arrowIntensity"]
});

let buttonRenderer = config => canvasRenderer(renderArrowLine, {
  dimensions: ["length", "width"],
  intensities: ["arrowIntensity"],
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
  buttons: condition => [
    {
      label: "A&nbsp;&nbsp;&nbsp;► ► ►&nbsp;&nbsp;&nbsp;B",
      response: { reverse: false }
    },
    {
      label: "A&nbsp;&nbsp;&nbsp;◄ ◄ ◄&nbsp;&nbsp;&nbsp;B",
      response: { reverse: true }
    }
  ]
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




/*
"ChoiceTask" Factory parameters:

name
description
stimulusRenderer
defaultParameters
buttonParameters
defaultChoices
dimensions: ["width","length"],
intensities: ["gapIntensity"]

-- optional
verifyChoice: f()
controller
interfaces

-- overrides (in experiment file / factory call)
id
description
parameters
conditions (choices?)
buttonParameters
verifyChoice
interaces? / roles?
*/