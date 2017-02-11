var synaptic = require('synaptic'); // this line is not needed in the browser
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

function Perceptron(input, hidden, output) {
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

//Dictionari to store networks
var netDict = [];

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
  if( ! existPlayer(playerid)){
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
  if( ! existPlayer(playerid) ){
    console.console.log("playerid not in netDict");
  }
  outputLayer = netDict[playerid].activate(input);
  return outputToAction(outputLayer);
}

//exports
exports.existPlayer = existPlayer;
exports.createPlayer = createPlayer;
exports.getAction = getAction;
exports.trainNet = trainNet;


function get_relative_position(obj1, obj2) {
    var x;
    var y;

    if(abs(obj1.x - obj2.x) < 30) {
      x = obj1.x - obj2.x;
    }
    else {
      x = 60 - abs(obj1.x - obj2.x);
      if(obj1.x - obj2.x > 0) x = -x;
    }

    if(abs(obj1.y - obj2.y) < 13) {
      y = obj1.y - obj2.y;
    }
    else {
      y = 25 - abs(obj1.y - obj2.y);
      if(obj1.y - obj2.y > 0) y = -y;
    }

    return {x : x, y : y};
}

function transformState(active_player, player_positions, bullets) {

    var player1 = player_positions[active_player];
    var player2;

    //define custom sort function
    function sortfunction(a, b){
      var pos;
      pos = get_relative_position(a, player1);
      distanceA = abs(pos.x) + abs(pos.y);

      pos = get_relative_position(b, player1);
      distanceB = abs(pos.x) + abs(pos.y);

      return distanceA - distanceB;
    }

    var i = 0;
    for(player_position in player_positions) {
        if(i > 1) break;

        if(player_position != active_player) player2 = player_positions[player2];
    }

    var new_state = [player1.d%2, player1.d/2];

    //addd player2 relative positions
    var pos;
    pos = get_relative_position(player1, player2);
    new_state.push(pos.x);
    new_state.push(pos.y);

    //add player2 direction
    new_state.push(player2.d%2);
    new_state.push(player2.d/2);

    if(bullets.lenght > 1) {

        //get bullets
        bullets.sort(sortfunction);
        pos = get_relative_position(player1, bullets[0]);

        //add bullet1
        new_state.push(1);
        new_state.push(pos.x);
        new_state.push(pos.y);
        new_state.push(bullets[0].d%2);
        new_state.push(bullets[0].d/2);

        pos = get_relative_position(player1, bullets[1]);

        //add bullet2
        new_state.push(1);
        new_state.push(pos.x);
        new_state.push(pos.y);
        new_state.push(bullets[1].d%2);
        new_state.push(bullets[1].d/2);
    }
    else if(bullets.length == 1) {

        pos = get_relative_position(player1, bullets[0]);

        //add bullet1
        new_state.push(1);
        new_state.push(pos.x);
        new_state.push(pos.y);
        new_state.push(bullets[0].d%2);
        new_state.push(bullets[0].d/2);

        //add bullet2
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);
    }
    else {
        //add bullet1
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);

        //add bullet2
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);
    }

    return new_state;
    
}

exports.transform_state = transformState;