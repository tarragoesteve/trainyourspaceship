var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser");

var network = require('./perceptron');

app.set('views', __dirname + "/views");
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Server
http.listen(3000, function(){
 	console.log('listening on *:3000');
});

//Serve html
app.get('/', function(req, res){
 	res.render('index.html', {});
});

//IO
var players=[];
var keys={};
var positions={};
var bullets=[];
var player_types = {};

var playing = false;
var players_actions = true;

var player_Ai = {};

io.on('connection', function(socket){

	if(!(socket.id in players)) {
		if (players.length > 1) {
		console.log('we are full');

		} else {
			players.push(socket.id);
			network.createPlayer(socket.id);
			player_Ai[socket.id] = false;
			console.log('conected as ' + socket.id);
		}
	}

	socket.on('disconnect', function(){
		var index = players.indexOf(socket.id);
		players.splice(index, 1);
	});
	socket.on('keyPressed', function(msg){
		keys[socket.id]=msg;
	});
	socket.on('playerType', function(msg){
		player_types[socket.id] = msg;
	});

	socket.on('startGame', function(aiPlayers){
		io.emit('canvasVisible', '');
		bullets=[];

		if(aiPlayers != "" && aiPlayers != 'none') {
			for(i in players) {
				var id_play = players[i];
				if(aiPlayers == 'all' || id_play != socket.id) {
					player_Ai[id_play] = true;
					network.startTraining(id_play);
				}
				else player_Ai[id_play] = false;
			}
		}
		else {
			for(i in players) {
				var id_play = players[i];
				player_Ai[id_play] = false;
			}
		}

		if(players.length>1){
			for (var i=0; i<2; ++i){
				keys[players[i]]=0;
				positions[players[i]]={x : Math.round(Math.random()*59),y : Math.round(Math.random()*24), d : Math.round(Math.random()*3), bull: 0, life: 3};
				if(typeof player_types[players[i]] == 'undefined' || player_types[players[i]] == 1) positions[players[i]].life += 2;
			}
			playing = true;
		}
	});
});

function mainloop() {
	if(!playing) return;
	for(var i=0; i<2;++i){
		var id_play=players[i];
		if(positions[id_play].bull!=0) positions[id_play].bull--;
		//moure players
		if(players_actions){

			if(player_Ai[id_play]) {
				var data = network.transformState(id_play, positions, bullets);
				keys[id_play] = network.getAction(id_play,data);
			}
			else {
				var data = network.transformState(id_play, positions, bullets);
				network.trainNet(id_play, data, keys[id_play]);
			}

			//actualitzar posicions
			if(keys[id_play]==0){ //recte
				if(positions[id_play].d==0) positions[id_play].y--;
				else if(positions[id_play].d==1) positions[id_play].x++;
				else if(positions[id_play].d==2) positions[id_play].y++;
				else if(positions[id_play].d==3) positions[id_play].x--;
			}
			else if(keys[id_play]==1){//gir esquerra
				keys[id_play] = 0;
				positions[id_play].d--;
				if(positions[id_play].d==-1) positions[id_play].d=3;
			}
			else if(keys[id_play]==2){//gir dreta
				keys[id_play] = 0;
				positions[id_play].d++;
				if(positions[id_play].d==4) positions[id_play].d=0;
			}
			//comprovar posicions correctes i actualitzar si surt dels marges
			if(positions[id_play].y>24) positions[id_play].y=0;
			else if(positions[id_play].y<0) positions[id_play].y=24;
			if(positions[id_play].x>59) positions[id_play].x=0;
			else if(positions[id_play].x<0) positions[id_play].x=59;
		}

		//disparar i tractar bales
		if(keys[id_play]==3 && positions[id_play].bull==0){
			keys[id_play] = 0;
			var player_position = positions[id_play];
			var new_bullet = {x :player_position.x , y :  player_position.y, d : player_position.d, t : 30};
			bullets.push(new_bullet);
			if ( player_types[id_play] == 2){
				var sec_bullet = {x :player_position.x , y :  player_position.y, d : (player_position.d + 2)%4, t : 30};
				bullets.push(sec_bullet);
			}
			positions[id_play].bull=10;
			if(player_types[id_play] == 3) positions[id_play].bull=5;
		}

	}

	//mou bales
	for(var i=0; i<bullets.length; ++i){
		bullets[i].t--;
		if(bullets[i].t==0) {
			bullets.splice(i, 1);
			continue;
		}
		if(bullets[i].d==0) bullets[i].y--;
		else if(bullets[i].d==1) bullets[i].x++;
		else if(bullets[i].d==2) bullets[i].y++;
		else if(bullets[i].d==3) bullets[i].x--;

		if(bullets[i].y>24) bullets[i].y=0;
		else if(bullets[i].y<0) bullets[i].y=24;
		if(bullets[i].x>59) bullets[i].x=0;
		else if(bullets[i].x<0) bullets[i].x=59;
	}

	//enviar estat
	var obj = {positions_players: positions, positions_bullets: bullets};
	io.emit('updateGame', obj);

	//colisions
	for(var i=0; i<bullets.length;++i){
		for(var j=0; j<2; ++j){
			var id_play=players[j];
			if(bullets[i].x==positions[id_play].x && bullets[i].y==positions[id_play].y){
				//still alife?
				positions[id_play].life--;
				bullets.splice(i, 1);
				if(positions[id_play].life==0){
					//player dead
					var obj={id: id_play, pos_x: positions[id_play].x, pos_y: positions[id_play].y};
					io.emit('playerDead',obj);
					playing=false;
				}
				break;
			}
		}
	}

	//canviar si es mou el jugador o no
	players_actions = !players_actions;
}

setInterval(mainloop,100);
