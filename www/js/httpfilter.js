//
angular.module("democlient").config(function($httpProvider){
  var base = "http://192.168.25.2:8080";
  $httpProvider.interceptors.push(function($q){
    return {
      request:function(config) {
        if(!(/^http(s)?:|^views\/|^img\//.test(config.url)))
          config.url = base+config.url;
        return config || $q.when(config);
      }
    };
  });
});
