console.log('homepage.js connected');

var socket = io();
var $nicknameInput = $('#nicknameInput');
var $userForm = $('#userForm');
// var $infoSound = $('#infoSound');
var $infoBox = $('#infoBox');
var $divMsg = $('div.msg');


//making random room ids
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text + Math.floor(Math.random() * 99999);
}

$divMsg.click(function (e) {
  e.preventDefault();
  var roomId = makeid();
  console.log('creating chat room');
  socket.emit('create chat room', roomId, function () {

  });
  $nicknameInput.val('');
  window.location = "http://localhost:8000/chat/" + roomId;
});

// ELIRAN ADDED SOUNDS
$infoBox.mouseenter(function () {
  $('#infoSound').get(0).play();
});

$divMsg.mouseover(function () {
  $('#createSound').get(0).play();
});

$divMsg.click(function(){
  $('#creatClickSound').get(0).play();
});