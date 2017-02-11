var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
io.on('connection', function(socket){
   
	//Hello
	socket.on('Hello', function(msg){
		io.emit('Hello', '');
	});
	
});