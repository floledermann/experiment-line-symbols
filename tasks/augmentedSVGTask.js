
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const resource = require("stimsrv/util/resource");
const displayConfig = require("stimsrv/stimulus/displayConfig");
const random = require("stimsrv/controller/random");

const DEFAULTS = {
  name: "SVG",
  description: "Display a SVG-based stimulus",
  choices: [{label: "Continue"}],
  iconScaleFactor: 1,
  baseMap: true
};

// generates the SVG code of the line type for the header 
function svgStr(kind, pixelsPerMM) {
  let svgStr = `
    <svg viewBox="0 -7.5 30 15" width="${8 * pixelsPerMM}" height="${5 * pixelsPerMM}" style="vertical-align: bottom;">
    <defs>
      <line id="legendLine" x1="0" y1="0" x2="30" y2="0"/>
    </defs>`;
    
  if (kind == 1) {
    svgStr += `
      <g id="road-1">
        <use href="#legendLine" stroke="#989898" stroke-width="5" fill="none"/>
      </g>`;
  }
  if (kind == 2) {
    svgStr += `
      <g id="road-2">
        <use href="#legendLine" stroke="#000000" stroke-width="9" fill="none"/>
        <use href="#legendLine" stroke="#ffffff" stroke-width="3.3" fill="none"/>
      </g>`;
  }
  if (kind == 3) {
    svgStr += `
      <g id="road-3">
        <use href="#legendLine" stroke="#000000" stroke-width="9" fill="none"/>
        <use href="#legendLine" stroke="#ffffff" stroke-width="6" fill="none"/>
        <use href="#legendLine" stroke="#000000" stroke-width="1.8" fill="none"/>
      </g>`;
  }
  
  svgStr += `</svg>`;
  
  return svgStr;
}

function svgRenderer(options) {

  options = Object.assign({
    dimensions: [],
    defaultDimensions: ["width", "height"],
  }, options);

  options.dimensions = options.dimensions.concat(options.defaultDimensions);
  
  function augmentSVG(svg, condition, context) {
     
    function use(id, parent) {
      let use = svg.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#" + id);
      parent.appendChild(use);       
    }

    if (!condition.baseMap) {
      svg.rootElement.style.backgroundColor = "#ffffff";
      let layers = svg.querySelectorAll('svg > g');
      console.log(layers.length);
      for (let l of layers) {
        if (l.getAttribute("id") != "map: multipoint_rural") l.parentElement.removeChild(l);
      }
    }
    
    let similars = [
      [1,2,3,0],
      [2,3,1,0],
      [3,2,1,0]
    ][condition.kind-1];

    let unitsPerPixel = svg.rootElement.viewBox.baseVal.width / condition.width;
    
    let w = condition.lineWidth * unitsPerPixel;
    
    let layer1_1 = svg.rootElement.getElementById("layer-1-part-1");
    layer1_1.setAttribute("stroke-width",w);
    let layer2_1 = svg.rootElement.getElementById("layer-2-part-1");
    layer2_1.setAttribute("stroke-width",w);
    let layer2_2 = svg.rootElement.getElementById("layer-2-part-2");
    layer2_2.setAttribute("stroke-width",w*0.333);
    let layer3_1 = svg.rootElement.getElementById("layer-3-part-1");
    layer3_1.setAttribute("stroke-width",w);
    let layer3_2 = svg.rootElement.getElementById("layer-3-part-2");
    layer3_2.setAttribute("stroke-width",w*0.666);
    let layer3_3 = svg.rootElement.getElementById("layer-3-part-3");
    layer3_3.setAttribute("stroke-width",w*0.2);
        
    for (let i=0; i<condition.numLocations; i++) {
      
      let kind = similars[condition.indices[i]];
      
      let id = "road" + ((i+1)+"").padStart(2, "0");
      let el = svg.rootElement.getElementById(id);
      
      if (kind == 0) el.style.display = "none";
      if (kind == 1) {}; // no change needed
      if (kind == 2) {
        use(id, layer2_1);
        use(id, layer2_2);
      };
      if (kind == 3) {
        use(id, layer3_1);
        use(id, layer3_2);
        use(id, layer3_3);  
      };
    };
  };
  
  let parent = null;
  let document = null;
  let dppx = 1;
  
  let renderer = function(context) {
    
    let display = displayConfig(Object.assign({}, options, {
      warnDefaults: options.warn
    }))(context);

    return {
      initialize: function(_parent) {
        parent = _parent;
        document = parent.ownerDocument;
        dppx = document.defaultView.devicePixelRatio || 1; 
      },
      
      render: function(condition) {
        
        let svg = document.createElement("object");
        svg.style.visibility = "hidden";
        
        let header = document.createElement("header");
        let pixelsPerMM = display.dimensionToScreenPixels("1mm") / dppx;
        
        header.innerHTML = 'Count: ' + svgStr(condition.kind, pixelsPerMM) + ' Road Segments';
        header.style.fontSize = (display.dimensionToScreenPixels("4mm") / dppx) + "px";
        parent.style.backgroundColor = "rgb(90%,90%,90%)";
        header.style.color = "#000000";
        header.style.marginBottom = (pixelsPerMM) + "px";
        //header.style.position = "absolute";
        
        
        for (let key of options.dimensions) {
          console.log("Dimension: ", key, condition[key]);
          condition[key] = display.dimensionToScreenPixels(condition[key], condition);
        }

        svg.width = condition.width / dppx;
        svg.height = condition.height / dppx;
        svg.data = resource.url(condition.svg);
        
        svg.addEventListener("load", e => {
          augmentSVG(svg.getSVGDocument(), condition);
          svg.style.visibility = "visible";
        });
        
        parent.innerHTML = "";
        parent.appendChild(header);
        parent.appendChild(svg);
      }
    }
  }
  
  return renderer;
  
}


let renderer = config => svgRenderer({
  dimensions: ["lineWidth"]
});

let buttonRenderer = config => canvasRenderer(renderIcon, {
  dimensions: ["size"],
  // make sure to specify width and height of the canvas in pixels
  width: 100,
  height: 50,
  // each condition received can be adapted to the button by overriding some of its properties
  overrideCondition: config.buttonCondition || {
    size: "8mm"
  }
});

let buttons = config => htmlButtons({
  buttons: condition => ([0,1,2,3,4,5,6,7,8,9,10,11,12].map(
    num => ({
      label: num,
      response: { count: num }
    })
  )),
  header: condition => condition.iconData.title
});


const task = simpleTask({
  defaults: DEFAULTS, 
  //staticOptions: ["augmentSVG"],
  // The interfaces the task provides.
  // These can be remapped by the user with the "<interfaceName>Interface" configuration properties.
  interfaces: {
    display: renderer,
    monitor: renderer,
    response: buttons,
  },
  // Resources to load
  resources: config => config.resources
});

task.renderer = renderer();

module.exports = task;
