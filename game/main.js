var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser")

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
var playing=false;
var players_actions = true;

io.on('connection', function(socket){
   players.push(socket.id);
	//Hello
	socket.on('disconnect', function(){
		delete players[socket.id];
	});
	socket.on('keyPressed', function(msg){
		keys[socket.id]=msg;
	});
	socket.on('startGame', function(){
		if(players.length>1){
			for (var i=0; i<2; ++i){
				keys[socket.id]=0;
				positions[players[i]]={x : Math.round(Math.random()*24),y : Math.round(Math.random()*59), d : Math.round(Math.random()*3)};
				console.log('Comença la partida');
			}
			playing = true;
		}
	});
});
	
function mainloop(){
	if(!playing) return;
	for(var i=0; i<2;++i){
		var id_play=players[i];

		//moure players
		if(players_actions){
			//actualitzar posicions
			if(keys[id_play]==0){ //recte
				if(positions[id_play].d==0) positions[id_play].x++;
				if(positions[id_play].d==1) positions[id_play].y++;
				if(positions[id_play].d==2) positions[id_play].x--;
				if(positions[id_play].d==3) positions[id_play].y--;
			}
			else if(keys[id_play]==1){//gir esquerra
				positions[id_play].d--;
				if(positions[id_play].d==-1) positions[id_play].d=3;
			}
			else if(keys[id_play]=2){//gir dreta
				positions[id_play].d++;
				if(positions[id_play].d==4) positions[id_play].d=0;
			}
			//comprovar posicions correctes i actualitzar si surt dels marges
			if(positions[id_play].x>24) positions[id_play].x=0;
			else if(positions[id_play].x<0) positions[id_play].x=24;
			if(positions[id_play].y>59) positions[id_play].y=0;
			else if(positions[id_play].y<0) positions[id_play].y=59;
		}

		//disparar i tractar bales
		if(keys[id_play]==3){
			var player_position = positions[id_play];
			var new_bullet = {x :player_position.x , y :  player_position.y, d : player_position.d, t : 20};
			bullets.push(new_bullet);
		}
		//mou bales
		for(var i=0; i<bullets.length; ++i){
			bullets[i].t--;
			if(bullets[i].t==0) delete bullets[i];
		}
	}
	//enviar estat
	var obj = {positions_players: positions, positions_bullets: bullets};
	io.emit('updateGame', obj);

	//colisions
	for(var i=0; i<bullets.length;++i){
		for(var j=0; j<2; ++j){
			var id_play=players[j];
			if(bullets[i].x==positions[id_play].x && bullets[i].y==positions[id_play].y){
				//player dead
				io.emit('playerDead', id_play);
				playing=false;
			}
		}
	}

	//vector tecles premudes a res
	for(var i=0; i<2; ++i){
		id_play=players[i];
		keys[id_play] = 0;
	}

	//canviar si es mou el jugador o no
	if(players_actions) players_actions=false;
	else players_actions=true;
}

setInterval(mainloop,100);