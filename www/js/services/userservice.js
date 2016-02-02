// serviços de condômino
angular.module("democlient").factory("userservice",function($http,$state){
  return {
    login:function(loginData){
      return $http({
        data:JSON.stringify(loginData),
        url:"/user/login",
        method:"POST",
      });
    },
    logout:function(){
      if(localStorage && localStorage.getItem("democlient-user")){
        localStorage.removeItem("democlient-user");
      }
    },
    newUser:function(loginData){
      return $http({
        data:JSON.stringify(loginData),
        url:"/user/new",
        method:"POST",
      });
    },
    getLoggedUser:function(){
      if(localStorage && localStorage.getItem("democlient-user")){
        var localUser = JSON.parse(localStorage.getItem("democlient-user"));
        return localUser;
      }
    }
  };
});
