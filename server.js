const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
// const multer  = require('multer')
const mysql = require('mysql');
const ioServer = require('socket.io') 



const app = express()
const http = require('http')
const https = require('https')
const port_http = process.env.PORT || 3000 //for http 
const port_https = process.env.PORT || 3443 // for https 
const debug  = require('debug')('https')



app.use(session({secret: 'admin123',saveUninitialized: true,resave: true}));
app.engine('html', require('ejs').renderFile); // HTML Render method
app.use(bodyParser.urlencoded({extended:true})); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
// app.use(multer()); // for parsing multipart/form-data
// defult index disabled method
app.use(express.static(__dirname + "/public", {
      index: false
    }));


var sess; // global session, NOT recommended



//file requires 
const User = require(__dirname + '/public/models/user');
const Room = require(__dirname + '/public/models/room');
const UserRoom = require(__dirname + '/public/models/userroom');
const helper = require(__dirname + '/public/config/helper');

var fs = require('fs');

var opts = {
  key: fs.readFileSync('ssl_cert/privatekey.pem'),
  cert: fs.readFileSync('ssl_cert/server.crt')
};


var httpsServer = https.createServer(opts, app)
var httpServer = http.createServer(app);





/********** route ***********/
// Routes

// app.use( function(req, res, next) {
//     if (req.url == '/') {
//         res.render(__dirname + "/public/index.html")
//     } else {
//         next();
//     }
// });

// function index(req, res) {
//   res.render(__dirname + "/public/index.html",{mobile:""})
// }

app.get('/test', function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  var table =
      {
        "mobile" : "123123"
      }
  res.send(JSON.stringify(table)); 

	//res.send("hi");
	// res.sendFile("public/test.html",{root: __dirname });
	// var name = "sridhar";
	// res.render(__dirname + "/public/test.html", {name:name});
});




app.get('/', async function(req, res) {

  // res.send("<h2><center><font color=\"red\">Invalid Url</font></center></h2>")
  res.render(__dirname + "/public/joinroom.html",);
});

app.get('/register/:user_id?', async function(req, res) {
  sess = req.session;
  console.log(sess);
  var issess = isSession(req,res,sess);
  if(issess != true){
    return issess;
  }

  
  var uModel = new User();
  var user_id = req.params.user_id;
  var mobile = "" ;
  if(user_id)
  {
    var result = await uModel.getUserbyUserId(user_id);
    if(result.length > 0)
    {
      mobile = result[0].mobile;
    }
  }
	res.render(__dirname + "/public/index.html",{mobile:mobile});
});


app.post('/register',async function(req, res) {
	var u = new User();
	var result = await u.getUserbyMobile(req.body.mobile);
  console.log(result)    
   if(result.length > 0)
   {
      var user = result[0];
      return profilePage(res,user);
   }
   else
   {
      await u.insertMobileUser(req.body.mobile);
      var result = await u.getUserbyMobile(req.body.mobile);
      if(result.length > 0)
      {
        var user = result[0];
        return profilePage(res,user);
      }
   }
 
});

app.get('/profile/:user_id',async function(req, res) {
    var user_id = req.params.user_id;
    var uModel = new User();
    var result = await uModel.getUserbyUserId(user_id);
    if(result.length > 0)
    {
      var user = result[0];
      return profilePage(res,user);  
    }
    else
    {
      res.send("<h2><center><font color=\"red\">Invalid Url</font></center></h2>")
    }

});

app.post('/profile/:user_id',async function(req, res) {

  sess = req.session;
  

  var uModel = new User();
  var data = req.body;
  var user = {}; 
  var error = {};


  user.user_id = req.params.user_id;
  user.name    = data.name;
  user.mobile  = data.mobile
  user.email   = data.email
  user.city    = data.city;
  user.state   = data.state;
  user.updated_at =helper.indianDateTime();
  user.dob     = null;
  input_dob  = data.dob;

  //Store session
  sess.user_id = user.user_id;
  sess.name = user.name;

  if(input_dob)
  {
      user.dob   = new Date(input_dob.split("/").reverse().join("-"));
  }
    console.log(user.dob);

  var result_mob = await uModel.getUserbyMobile(user.mobile);
  if(result_mob.length > 0)
  {
      if(result_mob[0].user_id != user.user_id)
      {
          error.mobile = "Mobile number already exists";
      }
  }

  var result_email = await uModel.getUserbyEmail(user.email);
  if(result_email.length > 0)
  {
      if(result_email[0].user_id != user.user_id)
      {
          error.email = "Eamil Id already exists";
      }
  }

  if (Object.keys(error).length) {
    return profilePage(res,user,error);
  }
  else
  { 
      res.redirect("/mystream");  
  }

});




/////////////////// API /////////////////////////////////////


app.post('/api/room/create',async function(req, res) {
  try {
    var rModel = new Room();
    var data = req.body;
    var error = {};
    console.log(data);
    
    var result = await rModel.insertRoomNo(data.room_no);
    console.log(result);
    res.json({status : 1,error : ""});

  }catch(err) {
    res.json({status : 0,error : "Error! Please try after some time"});
  }
});


app.post('/api/room/verify',async function(req, res) {
  try {
    var rModel = new Room();
    var data = req.body;
    var error = {};
    console.log(data);
    var result = await rModel.getRoombyRoomNo(data.room_no);
    if(result.length >0)
    {
      res.json({status : 1,error : ""});  
    }
    else
    {
      res.json({status : 0,error : "Invalid Room Number"});   
    }
    

  }catch(err) {
    res.json({status : 0,error : "Error! Please try after some time"});
  }
});


app.post('/api/get/userbysocketid',async function(req, res) {
  // try {
    var urModel = new UserRoom();
    var data = req.body;
    var error = {};
    console.log(data);
    
    var result = await urModel.getUserbySocketId(data.socket_id);
    console.log(result);
    var user =   result[0];
    res.json({status : 1,data : user,error : ""});

  // }catch(err) {
  //   res.json({status : 0,error : "Error! Please try after some time"});
  // }
});


////////////////// Web Con Video Stream ///////////////////////////

app.get('/webcon', function(req, res) {
  user_id = req.params.user_id;
  res.render(__dirname + "/public/webcon.html",{user_id,user_id});
});

app.get('/room/:room_no', async function(req, res) {
  try
  {
    sess=req.session;
    var rModel = new Room();
    room_no = req.params.room_no;
    var result = await rModel.getRoombyRoomNo(room_no);
    if(result.length >0)
    {
        var room =  result[0];
        console.log(room);
        sess.room_id = room.room_id;
        sess.room_no = room.room_no; 
        console.log(sess);
        res.redirect('/register')
        // res.render(__dirname + "/public/room.html",{room_id,room_id});  
    }
    else
    {
      res.send("<h2><center><font color=\"red\">Invalid url.</font></center></h2>")
    }

  }
  catch(err){
    console.log(err);
    res.send("<h2><center><font color=\"red\">Error: Please try after some time.</font></center></h2>")
  }
  
});


app.get('/mystream', async function(req, res) {
  try
  {
    sess=req.session;
     console.log(sess);
      var issess = isSession(req,res,sess);
      if(issess != true){
        return issess;
      }
      else
      {
        var room_no =   sess.room_no;
        var room_id =   sess.room_id;


        return res.render(__dirname + "/public/room.html",{room_no,room_no});   
      }
  }
  catch(err){
    console.log(err);
    res.send("<h2><center><font color=\"red\">Error: Please try after some time.</font></center></h2>")
  }
  
});





////////////////// Socket io /////////////////////

var io = new ioServer()

io.listen(httpServer);
io.listen(httpsServer);


io.on('connection', function(socket){

  console.log("i am socket");
  
  socket.on('join', function(room) {
    console.log("session : " + sess.room_id);
    console.log("i am join : " + room);
    socket.room = room;
    socket.join(room);
    insertUserRoom(socket.id);
    // console.log(socket.id + " now in rooms ", socket.rooms);
    var count =  io.sockets.adapter.rooms[room].length;
    var sockets =  io.sockets.adapter.rooms[room].sockets;
    // console.log(io.in(socket.room).clients().sockets);

    io.sockets.in(socket.room).emit("user-joined", socket.id,count, Object.keys(sockets),socket.room);

  });
  
  
  socket.on('signal', (toId, message) => {
      // console.log(" to : " + toId)
      // console.log(" socket.id : " + socket.id)
      io.to(toId).emit('signal', socket.id, message);
      //socket.broadcast.to(socket.room).emit('signal', socket.id, message);
  });

  socket.on("message", function(data){
      console.log(" message : " + socket.room)
      io.sockets.in(socket.room).emit("broadcast-message", socket.id, data);
  })

  socket.on('disconnect', function() {
    console.log(" disconnect : " + socket.room)
    io.sockets.in(socket.room).emit("user-left", socket.id);
    UpdateLeaveRoom(socket.id);
    socket.leave(socket.room);
  })
});


////////////////////// other functions //////////////////////////



function profilePage(res,user,error=null) {
  res.render(__dirname + "/public/profile.html", {user:user,error:error});
}


function isSession(req,res,sess)
{
  if(!sess.room_id){
    return res.send("<h2><center><font color=\"red\">your session has expired. Please <a href='/' >click here go to Join Room</a></font></center></h2>")
  }
  else
  {
    return true;
  }
}

function insertUserRoom(_socket_id) {
  try {
    var urModel = new UserRoom();
    var user_id = sess.user_id;
    var room_id = sess.room_id;
    var join_at = helper.indianDateTime();
    var socket_id = _socket_id;

    urModel.insertUserRoom(user_id,room_id,join_at,socket_id);
    

  }catch(err) {
    console.log(err);
  }
}

function UpdateLeaveRoom(_socket_id) {
  try {
    var urModel = new UserRoom();
    var user_id = sess.user_id;
    var room_id = sess.room_id;
    var socket_id = _socket_id;

    urModel.UpdateLeaveRoom(user_id,room_id,socket_id);

  }catch(err) {
    console.log(err);
  }
}






httpServer.listen(port_http, () => console.log(`Active on ${port_http} port`))
httpsServer.listen(port_https, () => console.log(`Active on ${port_https} port`))
