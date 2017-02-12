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
var trainingSets = [];

function existPlayer(playerid) {
  return (playerid in netDict);
}

function createPlayer(playerid){
  netDict[playerid] = new Architect.Perceptron(6,5,4);
  trainingSets[playerid] = [];
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
  //netDict[playerid].activate(input);
  var weigth = 1/(Math.abs(input[0])+Math.abs(input[1])+2);
  weigth = 0.3;
  trainingSets[playerid].push({input: input, output: actionToOutput(action)});
  //netDict[playerid].propagate(weigth, actionToOutput(action));

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
  var outputLayer = netDict[playerid].activate(input);
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

    if(Math.abs(obj1.x - obj2.x) < 30) {
      x = obj1.x - obj2.x;
    }
    else {
      x = 60 - Math.abs(obj1.x - obj2.x);
      if(obj1.x - obj2.x > 0) x = -x;
    }

    if(Math.abs(obj1.y - obj2.y) < 13) {
      y = obj1.y - obj2.y;
    }
    else {
      y = 25 - Math.abs(obj1.y - obj2.y);
      if(obj1.y - obj2.y > 0) y = -y;
    }

    return {x : x, y : y};
}

function startTraining(playerId) {
    var trainer = new Trainer(netDict[playerId]);
    console.log('start training');
    trainer.train(trainingSets[playerId]);
    console.log('finish training');
}

exports.startTraining = startTraining;

function get_relative_enemy_position(obj1, obj2, dir){
    var x;
    var y;

    if(Math.abs(obj1.x - obj2.x) < 30) {
      x = obj1.x - obj2.x;
    }
    else {
      x = 60 - Math.abs(obj1.x - obj2.x);
      if(obj1.x - obj2.x > 0) x = -x;
    }

    if(Math.abs(obj1.y - obj2.y) < 13) {
      y = obj1.y - obj2.y;
    }
    else {
      y = 25 - Math.abs(obj1.y - obj2.y);
      if(obj1.y - obj2.y > 0) y = -y;
    }

    if( dir == 0){
      y = -y;

    } else if (dir == 1){
      var aux = y;
      y = x;
      x = aux;

    }else if (dir == 2){
      x = -x;

    }else if (dir == 3){
      var aux = x;
      x = -y;
      y = -aux;
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
      distanceA = Math.abs(pos.x) + Math.abs(pos.y);
      if (a.x * pos.x + a.y * pos.y > 0) distanceA += 50;

      pos = get_relative_position(b, player1);
      distanceB = Math.abs(pos.x) +Math.abs(pos.y);
      if (b.x * pos.x + b.y * pos.y > 0) distanceB += 50;

      return distanceA - distanceB;
    }

    for(player_position in player_positions) {
        if(player_position != active_player) player2 = player_positions[player_position];
    }

    var new_state = [];

    //addd player2 relative positions
    var pos;
    pos = get_relative_enemy_position(player1, player2,player1.d);
    new_state.push(pos.x/30);
    new_state.push(pos.y/12.5);

    if(bullets.length > 0) {

        //get bullets
        bullets.sort(sortfunction);
        pos = get_relative_position(player1, bullets[0]);

        //add bullet1
        new_state.push(pos.x);
        new_state.push(pos.y);
        new_state.push(bullets[0].d%2);
        new_state.push(Math.floor( bullets[0].d/2));

    }
    else {
        //add bullet1
        new_state.push(100);
        new_state.push(100);
        new_state.push(-1);
        new_state.push(-1);

    }

    return new_state;

}

exports.transformState = transformState;
