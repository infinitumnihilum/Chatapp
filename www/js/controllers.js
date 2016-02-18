angular.module('chat.controllers', [])

.controller('DashCtrl', function($scope,$window) {
  $scope.launch = function(url) {
      $window.open(url, "_system", "location=yes");
      return false;
  }
})

.controller('MysqlCtrl', function($scope) {})

.controller('OtherCtrl', function($scope,derpService) {
   $scope.derpEnablerChange = function() {
      console.log('Derp Enabler Change', $scope.derpEnabler.checked);
      derpService.setDerping($scope.derpEnabler.checked);
    };
    $scope.derpEnabler = { checked: false };
})

.controller('RedditCtrl', function($scope, $http){
  

})


.controller('ChatCtrl', function($scope, $stateParams, $ionicPopup, $timeout, Socket, Chat,derpService) {

  $scope.data = {};
  $scope.data.message = "";
  $scope.messages = Chat.getMessages();
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 250;

  Socket.on('connect',function(){

    if(!$scope.data.username){
      var nicknamePopup = $ionicPopup.show({
      template: '<input id="usr-input" type="text" ng-model="data.username" autofocus>',
      title: 'What\'s your nickname?',
      scope: $scope,
      buttons: [{
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.username) {
              e.preventDefault();
            } else {
              return $scope.data.username;
            }
          }
        }]
      });
      nicknamePopup.then(function(username) {
        Socket.emit('add user',username);
        Chat.setUsername(username);
      });
    }

  });

  Chat.scrollBottom();

  if($stateParams.username){
    $scope.data.message = "@" + $stateParams.username;
    document.getElementById("msg-input").focus();
  } 

  var sendUpdateTyping = function(){
    if (!typing) {
      typing = true;
      Socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();
    $timeout(function () {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        Socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  };

  $scope.updateTyping = function(){
    sendUpdateTyping();
  };

  $scope.messageIsMine = function(username){
    return $scope.data.username === username;
  };

  $scope.getBubbleClass = function(username){
    var classname = 'from-them';
    if($scope.messageIsMine(username)){
      classname = 'from-me';
    }
    return classname;
  };

  $scope.sendMessage = function(msg){
    var derpStatus = derpService.isDerping;
    if (derpService.isDerping()==true){
      var derpWords = ["herp","derp","herpa","derpa","derping","herp-derp","herpatitus","derpatrator","derparrhea","HerpeBirthday!"];
      var msgWords = msg.split(" ");
      msg="";
      for(var x=0;x<msgWords.length;x++){
          var ran = Math.floor(Math.random()*derpWords.length);
          console.log("random element index: "+ran);
          var wordToAdd = derpWords[ran];
          msg+=wordToAdd+" ";
      }
    }

    Chat.sendMessage(msg);
    $scope.data.message = "";
    
  };

})

.controller('PeopleCtrl', function($scope, Users) {
  $scope.data = Users.getUsers();
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})



.controller('AccountCtrl', function($scope, Chat) {
  $scope.username = Chat.getUsername();  
  $scope.chatnum = Chat.getChatnum();
}, true);