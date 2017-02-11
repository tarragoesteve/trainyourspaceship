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
			for (var i=0; i<players.length; ++i){
				keys[socket.id]=0;
				positions[players[i]]=[Math.round(Math.random()*24), Math.round(Math.random()*59), Math.round(Math.random()*3)];
			}
			playing = true;
		}
	});
});
	
function mainloop(){
	if(!playing) return;
	for(var i=0; i<players.length();++i){
		var id_play=players[i];
		//actualitzar posicions
		if(keys[id_play]==0){ //recte
			if(positions[id_play][2]==0) positions[id_play][0]++;
			if(positions[id_play][2]==1) positions[id_play][1]++;
			if(positions[id_play][2]==2) positions[id_play][0]--;
			if(positions[id_play][2]==3) positions[id_play][1]--;
		}
		else if(keys[id_play]==1){//gir esquerra
			positions[id_play][2]--;
			if(positions[id_play][2]==-1) positions[id_play][2]=3;
		}
		else if(keys[id_play]=2){//gir dreta
			positions[id_play][2]++;
			if(positions[id_play][2]==4) positions[id_play][2]=0;
		}
		else{//disparar
		}
		
		//comprovar posicions correctes i actualitzar si surt dels marges
		if(positions[id_play][0]>24) positions[id_play][0]=0;
		else if(positions[id_play][0]<0) positions[id_play][0]=24;
		if(positions[id_play][1]>59) positions[id_play][1]=0;
		else if(positions[id_play][1]<0) positions[id_play][1]=59;
	}
	if(players_actions) players_actions=false;
	else players_actions=true;

}

setInterval(mainloop,100);