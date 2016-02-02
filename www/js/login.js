// tela de login
angular.module("democlient").config(function($urlRouterProvider,$stateProvider){
  $urlRouterProvider.otherwise('/login');
  $stateProvider.state("login",{
    url:'/login',
    templateUrl:"views/login.html",
    controller:function($scope,$timeout,$rootScope,$state,$ionicPlatform,$ionicHistory,userservice,md5){
      $ionicHistory.clearHistory();
      $scope.loginData={username:"",password:"",uuid:""};
      $scope.usernotfound=false;

      $scope.doLogin=function(savedUser){
        $scope.loginData.uuid = $rootScope.deviceinfo.uuid;
        userservice.login({
          username:savedUser?$rootScope.user.username:$scope.loginData.username,
          password:savedUser?$rootScope.user.password:md5.createHash($scope.loginData.password),
          uuid:$scope.loginData.uuid
        }).error(function (result,status,headers,config) {
          alert("Ocorreu um erro ao tentar autenticar:\n" +
                "status:\n" + status + '\n'+
                "config:\n" + JSON.stringify(config) + '\n');
        }).then(function(result){
          if(result.status==200 && result.data){
            $rootScope.user=result.data;
            console.debug($rootScope.user);
            if(localStorage){
              var localUser = JSON.stringify($rootScope.user);
              localStorage.setItem("democlient-user",localUser);
            }
            $timeout(function(){
              $state.go("home");
            },100);
          }else{
            if(loginData.username.length){
              $scope.usernotfound=true;
            }
          }
        });
      };

      $scope.newUser = function(){
        if($scope.loginData.confirmPassword == $scope.loginData.password){
          userservice.newUser({
            username:$scope.loginData.username,
            password:md5.createHash($scope.loginData.password),
            uuid:$scope.loginData.uuid
          }).error(function (result,status,headers,config) {
            alert("Ocorreu um erro ao tentar cadastrar:\n" +
                  "status:\n" + status + '\n'+
                  "config:\n" + JSON.stringify(config) + '\n');
          }).then(function(result){
            $scope.doLogin();
          })
        }
        else{
          alert("Senha e confirmação não estão iguais");
        }
      }

      $ionicPlatform.ready(function() {
        $rootScope.deviceinfo = ionic.Platform.device();
        if(!$rootScope.deviceinfo.uuid){
          $rootScope.deviceinfo.uuid = "";
        }
        $rootScope.user = userservice.getLoggedUser();
        if($rootScope.user){
          $scope.doLogin(true);
        }
      });
    }
  });
});
