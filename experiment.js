
const tumblingE = require("stimsrv/task/tumblingE");

const pause = require("stimsrv/task/pause");
const loop = require("stimsrv/task/loop");

const staircase = require("stimsrv/controller/staircase");
const random = require("stimsrv/controller/random");
const sequence = require("stimsrv/controller/sequence");

const Dimension = require("another-dimension");

const filestorage = require("stimsrv/storage/filestorage");

const resource = require("stimsrv/util/resource");
const htmlButtons = require("stimsrv/ui/htmlButtons");

const arrowLineTask = require("./tasks/arrowLineTask.js");
const parkingLineTask = require("./tasks/parkingLineTask.js");
const lineWidthTask = require("./tasks/lineWidthTask.js");
const countParallelLinesTask = require("./tasks/countParallelLinesTask.js");

const setup = require("./setup-lab.js");

const messages = require("./messages.js");

pause.defaults({
  background: "#eeeeff",
  textcolor: "#000000",
});

htmlButtons.defaults({
  clickSound: "/static/resource/resources/sound/click1.wav"
});


let DEBUG = false;  
//DEBUG = true;


// sizes in mm        
let SIZES = [1.5, 1.25, 1.0, 0.85, 0.7, 0.6, 0.5, 0.4];
let SIZES_2 = [1.5, 1.25, 1.0, 0.85, 0.7, 0.6, 0.5];

// for debug on monitor, double size
if (DEBUG) SIZES = SIZES.map(s => 10*s);

SIZES = SIZES.map(s => s+"mm");

// bezels width: 66mm height: 72mm


// stimsrv experiment definition
module.exports = {
  
  name: "HD Map Symbolization - Experiment 3",
  
  devices: setup.devices,
  roles: setup.roles,
  
  settings: {
    simpleBrowserRefresh: 5
  },
  
  serverConfigFile: "stimsrv-config.js",
  
  storage: filestorage({
    destination: "./data"
  }),
  
  resources: [
    "resources/images",
    "resources/sound"
  ],
  
  css: `
    body.has-ui-response {
      font-size: 24px;
    }
    
    body.is-device-stationB {
      font-size: 24px;
    }
    
    .content {
      max-width: 17em;
      text-align: left;
    }
    
    .has-role-main .content {
      max-width: 32em;
      font-size: 1.5em;
    }
    
    .buttons button .sub-ui {
      margin-top: 0.4em;
    }
    
    .buttons-tao {
      display: grid;
      grid-template-columns: repeat(5, 6em);
    }
    
    @media (orientation: portrait) {
      .buttons {
        display: grid;
        grid-template-columns: repeat(1, 12em);
        margin-top: 2em;
        font-size: 1em;
        flex: 0;
      }
      .buttons button {
        margin: 8px;
      }
      .current-task-survey-age .buttons button ,
      .current-task-survey-gender .buttons button {
        margin: 12px;
      }
      .legend {
        font-size: 0.8em;
      }
      header img {
        vertical-align: -0.15em;
      }
      header h1 img {
        vertical-align: -0.2em;
      }
      body[class*="current-task-icon-basemap-"] h1 {
        font-size: 1em;
        margin: 0 0 0.8em 0;
      }     
      body[class*="current-task-icon-basemap-"] .buttons {
        grid-template-columns: repeat(3, 5em);
        grid-template-rows: repeat(5, 2.8em);
        font-size: 1em;
        margin-top: 1em;
      }
      
    }
  `,
  
  tasks: [
/*
    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
         "main.display": messages.welcome
      },
    }),

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey1_age
      },
      button: htmlButtons([
        "18-25",
        "26-35",
        "36-45",
        "46-55",
        "56-65",
        "66 or older"
      ]),
      name: "survey-age",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey2_gender
      },
      button: htmlButtons([
        "Female",
        "Male",
        "Non-binary or other",
        "Would prefer not to answer",
      ]),
      name: "survey-gender",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.survey4_vision
      },
      button: htmlButtons([
        "Normal vision, without correction",
        "Corrected to normal\n(wearing glasses or contact lenses suitable for reading)",
        "Short-sighted\n(distant objects appear blurred)",
        "Far-sighted\n(near objects appear blurred)",
        "Other vision impairment",
        "Would prefer not to answer"
      ]),
      name: "survey-vision",
      store: true
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start1
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start2
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start3
      },
    }),  

    pause({
      message: {
        "*": "Please start the experiment at the Main Monitor.",
        "main.display": messages.start4
      },
    }),  
*/
    loop({
      
      context: {
        //targetStation: random.sequence(["A","B","C"]),
        targetStation: sequence(["A","B","C"]),
      },
      
      tasks: [
/*
        pause({
          message: context => {
            let msg = {
              "*": "Please continue the experiment at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Continue the experiment here.\n\nPress «Continue» when you have arrived.";
            return msg;
          },
        }),  

        pause({
          message: context => {
            let msg = {
              "*": "Press «Continue» when you are ready at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "You may take a short break and/or adjust the chair.\n\nPress «Continue» when you are ready to continue the experiment here.";
            return msg;
          },
        }),  

        pause({
          skip: context => context.targetStation != "B",
          message: context => {
            let msg = {
              "*": "Press «Continue» when you are ready at Station " + context.targetStation + ".",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Next Task:\nPress the button on the response device that matches the orientation of the shown graphics.\n\nPress «Continue» when you are ready.";
            return msg;
          },
        }),  

        tumblingE({
          //rotate: random([-5,+5]), // add random rotation to prevent aliasing
          angle: random.shuffle([0,90,180,270], { loop: true, preventContinuation: true }),
          pixelAlign: false,
          foregroundIntensity: 0,
          backgroundIntensity: 1,
          size: context => {
            // hack: if we are not at station B, immediately jump to next task
            if (context.targetStation != "B") return () => null;
            return staircase({
              startValue: "1.163mm",
              stepSize: 1.2,
              stepSizeFine: Math.sqrt(1.2),
              numReversalsFine: 3,
              stepType: "multiply", 
              minReversals: DEBUG ? 2 : 5,
            })(context)
          },
          // config (static)
          stimulusDisplay: context => "station" + context.targetStation + ".display"
        }),

        pause({
          message: context => {
            let msg = {
              "*": "",
              "control": "Transition to Station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Next Task:\nPress the button on the response device that best matches the shown graphics.\n\nPress «Continue» when you are ready.";
            return msg;
          },
        }),  
        */

        () => {
          
          return lineWidthTask({
            name: "line-variable-width",
            numCandidates: 4,
            stimulusAngle: random.range(-80, -70, 1),
            stimulusWidthCandidate: random(["A","B","C","D"]),
            candidatesBaseWidth: sequence.loop(["0.5mm","0.2mm","0.1mm"], { stepCount: 3 }),
            candidatesWidthFactor: sequence([1.4, 1.3, 1.2], { stepCount: 9 }),
            buttonCondition: { width: "5mm" },
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? lineWidthTask.renderer(context) : null,
            },
          })
        },

        () => {
          
          return arrowLineTask({
            name: "line-arrow",
            reverse: random.pick([true, false]),
            angle: random.range(-15, -70, 1),
            width: sequence(["1.2mm","1mm","0.8mm","0.7mm","0.6mm","0.5mm"], { stepCount: 4 }),
            buttonCondition: { width: "3mm" },
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? arrowLineTask.renderer(context) : null,
            },
          })
        },

        () => {
          
          return parkingLineTask({
            name: "line-parking",
            leftDashAngle: random.pick([45, -45]),
            rightDashAngle: random.pick([45, -45]),
            angle: random.range(-15, -70, 1),
            //choices: [{label: i.label, icon: i.svg, response: {icon: i.svg}}],
            width: sequence(["3mm","2.5mm","2mm","1.5mm"], { stepCount: 3 }),
            buttonCondition: { width: "5mm", angle: -20 },
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? parkingLineTask.renderer(context) : null,
            },
          })
        },

        () => {
          
          // randomize combinations of lineWidth & gap
          let permutations = [];
          
          
          return countParallelLinesTask({
            name: "count-lines",
            numLines: random.pick([6,7,8,9]),
            angle: random.range(-15, -70, 1),
            //choices: [{label: i.label, icon: i.svg, response: {icon: i.svg}}],
            lineWidth: sequence.loop(["0.2mm","0.1mm","0.08mm","0.06mm"], { stepCount: 2 }),
            gap: sequence(["1.2mm","1mm","0.8mm","0.7mm","0.6mm","0.5mm"], { stepCount: 8 }),
            buttonCondition: { width: "5mm", angle: -20 },
            interfaces: {
              display: config => context => "station" + context.targetStation == context.role ? countParallelLinesTask.renderer(context) : null,
            },
          })
        },

        pause({
          message: context => {
            let msg = {
              "*": "",
              "control": "Message at station " + context.targetStation
            };
            msg["station" + context.targetStation + ".display"] = "Next Task:\nCount the indicated icons on the map accurately, but also as fast as possible.\n\nPress «Continue» when you are ready.";
            return msg;
          },
        }),  
        


      ] // end of loop tasks
    }),

/*
    pause({
      message: {
        "*": "Please continue the experiment at the Main Monitor.",
        "main.display": "Thank you for your effort!\n\nThe experiment was completed successfully.\nThank you for your participation!"
      },
    }),
*/
    pause({
      message: {
        display: "The experiment was completed successfully.\nThank you for your participation!",
        response: "The experiment was completed successfully.\nThank you for your participation!",
        monitor: "Experiment ended."
      },
      button: "Store Results & Restart",
      buttondisplay: "control"
    }),
  ]
  
}