
const Dimension = require("another-dimension");

const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");

const DEFAULTS = {
  name: "variable-width-line",
  description: "A line and a set of candidate line widths.",
  stimulusPos: "40mm",
  stimulusLength: "50mm",
  stimulusAngle: -75,           // in degrees
  stimulusWidthCandidate: "B",
  candidatesBaseWidth: "0.5mm",
  candidatesWidthFactor: 1.5,
  candidatesLength: "20mm",
  candidatesAngle: -10,
  candidatesLabelGap: "10mm",
  candidatesFontSize: "5mm",
  numCandidates: 6,
  candidatesPos: "-30mm",
  candidateHeight: "13mm",
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  choices: [{label: "Continue"}]
};

let dimensionKeys = ["stimulusLength","stimulusPos","candidatesBaseWidth","candidatesLength","candidatesPos","candidatesLabelGap","candidatesFontSize","candidateHeight"];


function renderLineWidths(ctx, condition) {

  condition = Object.assign({
  }, condition);
  
  let c = condition;
  
  debugger;
  
  ctx.save();
  
  ctx.translate(c.candidatesPos, -c.candidateHeight * (c.numCandidates-1) / 2);

  ctx.fillStyle = condition.foregroundIntensity;
  
  let w = c.candidatesBaseWidth;
  ctx.font = c.candidatesFontSize + "px sans-serif";
  ctx.textBaseline = "middle";
  
  for (let i=0; i<c.numCandidates; i++) {
    
    ctx.save();
    let letter = String.fromCharCode(i + 65);
    ctx.fillText(letter, 0, 0);
    ctx.translate(c.candidatesLabelGap + c.candidatesLength / 2, 0);
    ctx.rotate(c.candidatesAngle * Math.PI / 180);
    ctx.beginPath();
    ctx.lineWidth = w;
    ctx.moveTo(-c.candidatesLength / 2, 0);
    ctx.lineTo(c.candidatesLength / 2, 0);
    ctx.stroke();
    ctx.restore();
    
    ctx.translate(0, c.candidateHeight);
    w *= c.candidatesWidthFactor;
  }
  
  ctx.restore();
  
  ctx.translate(c.stimulusPos, 0);
  ctx.rotate(c.stimulusAngle * Math.PI / 180);
  w = c.candidatesBaseWidth;
  
  for (let i=0; i<c.numCandidates; i++) {
    let letter = String.fromCharCode(i + 65);
    if (letter == c.stimulusWidthCandidate) {
      ctx.beginPath();
      ctx.lineWidth = w;
      ctx.moveTo(-c.stimulusLength / 2, 0);
      ctx.lineTo(c.stimulusLength / 2, 0);
      ctx.stroke();
      break;
    }
    w *= c.candidatesWidthFactor;
  }
 
}



let renderer = config => canvasRenderer(renderLineWidths, {
  dimensions: dimensionKeys,
  intensities: ["arrowIntensity"]
});

let buttonRenderer = config => canvasRenderer(renderLineWidths, {
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


