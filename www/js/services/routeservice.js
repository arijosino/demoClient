// serviços de condômino
angular.module("democlient").factory("routeservice",function($http,md5){
  return {
    listRoutes:function(userData){
      return $http({
        data:JSON.stringify(userData),
        url:"/route",
        method:"POST",
      });
    },
    saveRoute:function(route){
        return $http({
          data:JSON.stringify(route),
          url:"/route/save",
          method:"POST",
      });
    },
    deleteRoute:function(route){
        return $http({
          data:JSON.stringify(route),
          url:"/route",
          method:"DELETE",
      });
    }
  };
});
