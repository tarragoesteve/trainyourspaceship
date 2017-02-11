function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer = new Layer(hidden);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;


//
var myPerceptron = new Perceptron(16,5,4);

var netDict;

function existPlayer(playerid) {
  return (playerid in netDict);
}

function createPlayer(playerid){
  netDict[playerid] = new Perceptron(16,5,4);
  return existPlayer(playerid);
}

function outputToAction(output) {
  var j = 0;
  var max = output[0];
  for(var i = 0; i<4; ++i){
    if (output[i] > max){
      max = output[i];
      j = i;
    }
  }
  return j;
}

function trainNet(playerid, input, action){
  if( not existPlayer(playerid)){
    console.console.log("playerid not in netDict");
  }
  netDict[playerid].activate(input);
  netDict[playerid].propagate(0.3, actionToOutput(output));
}

function actionToOutput(action) {
  var ret = [0,0,0,0];
  ret[action] = 1;
  return ret;
}

function getAction(playerid, input){
  if( not existPlayer(playerid)){
    console.console.log("playerid not in netDict");
  }
  outputLayer = netDict[playerid].activate(input);
  return outputToAction(outputLayer);
}
