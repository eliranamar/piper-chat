console.log('homepage.js connected');

var socket = io();
var $nicknameInput = $('#nicknameInput');
var $userForm = $('#userForm');
// var $infoSound = $('#infoSound');
var $infoBox = $('#infoBox');



//making random room ids
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text + Math.floor(Math.random() * 99999);
}

$('div.msg').click(function (e) {
  e.preventDefault();
  var roomId = makeid();
  console.log('creating chat room');
  socket.emit('create chat room', roomId, function () {

  });
  $nicknameInput.val('');
  window.location = "http://localhost:8000/chat/"+roomId;
});

$infoBox.mouseenter(function () {
  $('#infoSound').get(0).play();
});

$('selector').on('click', function () {
  
});