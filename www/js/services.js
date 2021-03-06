angular.module('chat.services', [])

  .factory('Socket', function (socketFactory) {
    var myIoSocket = io.connect('http://chat.derpchat.io');
    mySocket = socketFactory({
      ioSocket: myIoSocket
    });
    return mySocket;
  })

  .factory('Users', function () {
    var usernames = [];
    usernames.numUsers = 0;

    var userImages = ['img/adam.jpg', 'img/ben.png', 'img/brock.jpeg', 'img/max.png', 'img/mike.png',
      'img/perry.png', 'img/tariq.jpeg'];

    return {
      getUsers: function () {
        return usernames;
      },
      addUsername: function (username) {
        usernames.push(username);
      },
      deleteUsername: function (username) {
        var index = usernames.indexOf(username);
        if (index != -1) {
          usernames.splice(index, 1);
        }
      },
      setNumUsers: function (data) {
        usernames.numUsers = data.numUsers;
      },
      getRanImage: function () {
        return userImages[Math.floor(Math.random() * userImages.length)];
      }
    };
  })

  .factory('derpService', function () {
    var derping = false;
    var derpCount = 0;
    return {
      isDerping: function () {
        return derping;
      },
      setDerping: function (bool) {
        derping = bool;
      },
      addDerp: function () {
        derpCount++;
      },
      getDerpCount: function () {
        return derpCount;
      }
    }
  })
  .factory('themeService', function () {
    var theme = 1;
    return {
      getTheme: function () {
        return theme;
      },
      setTheme: function (x) {
        theme = x;
      }
    }
  })
  .factory('bullshitService', function () {
    var bullshit = false;
    var bullCount = 0;
    return {
      isBullshit: function () {
        return bullshit;
      },
      setBullshit: function (bool) {
        bullshit = bool;
      },
      addBull: function () {
        bullCount++;
      },
      getBullCount: function () {
        return bullCount;
      }
    }
  })
  .factory('Chat', function ($ionicScrollDelegate, Socket, Users) {

    var username;
    var users = {};
    users.numUsers = 0;
    var userMessageCount = 0;
    var messages = [];
    var TYPING_MSG = '. . .';
    var mySound = new Audio('/android_asset/www/sound/DerpSoundEffect.mp3');

    var Notification = function (username, message) {
      var notification = {};
      notification.username = username;
      notification.message = message;
      notification.notification = true;
      return notification;
    };

    Socket.on('login', function (data) {
      Users.setNumUsers(data);
    });

    Socket.on('new message', function (msg) {
      addMessage(msg);
      mySound.play();
    });

    Socket.on('typing', function (data) {
      var typingMsg = {
        username: data.username,
        message: TYPING_MSG
      };
      addMessage(typingMsg);
    });

    Socket.on('stop typing', function (data) {
      removeTypingMessage(data.username);
    });

    Socket.on('user joined', function (data) {
      var msg = data.username + ' joined';
      var notification = new Notification(data.username, msg);
      addMessage(notification);
      Users.setNumUsers(data);
      Users.addUsername(data.username);
    });

    Socket.on('user left', function (data) {
      var msg = data.username + ' left';
      var notification = new Notification(data.username, msg);
      addMessage(notification);
      Users.setNumUsers(data);
      Users.deleteUsername(data.username);
    });

    var scrollBottom = function () {
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollBottom(true);
    };

    var addMessage = function (msg) {
      msg.notification = msg.notification || false;
      messages.push(msg);
      scrollBottom();
    };

    var removeTypingMessage = function (usr) {
      for (var i = messages.length - 1; i >= 0; i--) {
        if (messages[i].username === usr && messages[i].message.indexOf(TYPING_MSG) > -1) {
          messages.splice(i, 1);
          scrollBottom();
          break;
        }
      }
    };

    return {
      getUsername: function () {
        return username;
      },
      setUsername: function (usr) {
        username = usr;
      },
      getMessages: function () {
        return messages;
      },
      sendMessage: function (msg) {
        messages.push({
          username: username,
          message: msg
        });
        scrollBottom();
        Socket.emit('new message', msg);
      },
      scrollBottom: function () {
        scrollBottom();
      },
      incrementMessages: function () {
        userMessageCount++;
      },
      getUserMessageCount: function () {
        return userMessageCount;
      }
    };

  });
