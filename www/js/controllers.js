angular.module('chat.controllers', [])

.controller('DashCtrl', function($scope,$window) {
  $scope.launch = function(url) {
      $window.open(url, "_system", "location=yes");
      return false;
  }
})

  .controller('UserCtrl',function($scope,Users) {
      $scope.ranIMG = '../img/john.jpg';
      $scope.getIMG = function(){
        $scope.ranIMG = Users.getRanImage();
      }
      $scope.ranIMG = $scope.getIMG();
  })

.controller("CameraCtrl", function($scope, $cordovaCamera) {
    $scope.takePicture = function() {
        var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 500,
            targetHeight: 500,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }

})

.controller('OtherCtrl', function($scope,derpService,bullshitService,themeService) {
   $scope.derpEnablerChange = function() {
      console.log('Derp Enabler Change', $scope.derpEnabler.checked);
      derpService.setDerping($scope.derpEnabler.checked);
    };
    $scope.derpEnabler = { checked: false };

    $scope.bullshitEnablerChange = function() {
      console.log('Bullshit Enabler Change', $scope.bullshitEnabler.checked);
      bullshitService.setBullshit($scope.bullshitEnabler.checked);
    };
    $scope.bullshitEnabler = { checked: false };


  $scope.themeChanger = function(theme){
      themeService.setTheme(theme);
  };
  $scope.themeList = [
    { text: "Classic", value: 1, col: "black"},
    { text: "Neon", value: 2, col: "deeppink"},
    { text: "Christmas", value: 3, col: "red"},
    { text: "Evening Sky", value: 4, col: "#751aff"},
    { text: "Pumpkin", value: 5, col: "orange"}
  ];
  $scope.themeChoice = {
    theme : 1
  };
})

.controller('RedditCtrl', function($scope, $cordovaMedia, $ionicLoading){
    $scope.play = function(src) {
        var media = new Media(src, null, null, mediaStatusCallback);
          media.play();
    }

    var mediaStatusCallback = function(status) {
        if(status == 1) {
            $ionicLoading.show({template: 'Loading...'});
        } else {
            $ionicLoading.hide();
        }
    }

})


.controller('ChatCtrl', function($scope, $stateParams, $ionicPopup, $timeout, Socket, Chat,derpService,bullshitService,themeService) {

  $scope.data = {};
  $scope.data.message = "";
  $scope.messages = Chat.getMessages();
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 250;
  $scope.bgStyle={};
  $scope.customStyle={};
  $scope.nameStyle={};
  $scope.customColor = function(){
    var textCo="black";
    var bgCo = "white";
    var nameCo = "black";
    var themeVal = themeService.getTheme();
    if(themeVal == 2){textCo="deeppink"; bgCo="black"; nameCo="#00ccff";}
    else if(themeVal == 3){textCo="red" ; bgCo="green"; nameCo=textCo;}
    else if(themeVal == 4){textCo="white"; bgCo="#751aff"; nameCo="#ff4d88";}
    else if(themeVal == 5){textCo="orange"; bgCo="black"; nameCo="white";}
    $scope.customStyle.style = {"color": textCo};
    $scope.bgStyle.style = {"background-color": bgCo };
    $scope.nameStyle.style = {"color": nameCo };

  };
  $scope.customColor();



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
    var derpWords = ["herp","derp","herpa","derpa","derping","herp-derp","herpatitus","derpatrator","derparrhea","HerpeBirthday!"];
    var bsWords = ["synergy","agile","framework","test-driven development","minimum viable product","scrum","LAMP","big data","robust","top-down design","UML","waterfall","service-oriented architecture"];
    var msgWords = msg.split(" ");
    if(derpService.isDerping()&&bullshitService.isBullshit()){
        msg="";
        for(var x=0;x<msgWords.length;x++){
          console.log("random element index: "+ran);
          if(x%2==0){
            var ran = Math.floor(Math.random()*derpWords.length);
            var wordToAdd = derpWords[ran];
            derpService.addDerp();
          }
          else{
            var ran = Math.floor(Math.random()*bsWords.length);
            var wordToAdd = bsWords[ran];
            bullshitService.addBull();
          }
          msg+=wordToAdd+" ";

      }
    }
    else if (derpService.isDerping()==true){
      msg="";
      for(var x=0;x<msgWords.length;x++){
          var ran = Math.floor(Math.random()*derpWords.length);
          console.log("random element index: "+ran);
          var wordToAdd = derpWords[ran];
          msg+=wordToAdd+" ";
          derpService.addDerp();
      }
    }
    else if(bullshitService.isBullshit()==true){
      msg="";
      for(var x=0;x<msgWords.length;x++){
          var ran = Math.floor(Math.random()*bsWords.length);
          var wordToAdd = bsWords[ran];
          msg+=wordToAdd+" ";
          bullshitService.addBull();
      }
    }
    Chat.sendMessage(msg);
    $scope.data.message = "";
    Chat.incrementMessages();
  };
})

.controller('PeopleCtrl', function($scope, Users) {
  $scope.data = Users.getUsers();
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope,Chat,derpService,bullshitService) {
  $scope.username = Chat.getUsername();
  $scope.chatnum = Chat.getUserMessageCount();
  $scope.derpnum = derpService.getDerpCount();
  $scope.bullnum = bullshitService.getBullCount();
});
