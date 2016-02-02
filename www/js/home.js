angular.module("democlient").config(function($stateProvider){
  $stateProvider.state("home",{
    url:'/home',
    templateUrl:"views/home.html",
    controller:function($timeout,$scope,$rootScope,$state,$ionicHistory,leafletData,userservice,routeservice){
      $ionicHistory.clearHistory();

      if(!$rootScope.user){//caso o usuario dê refresh ignorando cache na home
        $rootScope.user = userservice.getLoggedUser();
      }


      var geocoder = new google.maps.Geocoder();
      var directionsService = new google.maps.DirectionsService();

      $scope.oAddress = {text:""};
      $scope.oLat = "";
      $scope.oLong = "";

      $scope.dAddress = {text:""};
      $scope.dLat = "";
      $scope.dLong = "";

      $scope.currentRoute = {
        routeid:{},
        routename:"",
        startAddress:"",
        endAddress:"",
        encodedPolyline:"",
        saved:false,
        userid:$rootScope.user.userid,
      };

      $scope.currentPolyline = undefined;

      $scope.savedRoutes = [];

      angular.extend($scope,{
        defaults: {
          maxZoom: 17,
          minZoom: 7,
          tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          tileLayerOptions: {
            opacity: 0.9,
            detectRetina: true,
            reuseTiles: true,
          },
          scrollWheelZoom: false
        },
        center: {
          lat:-3.7426492,
          lng:-38.5374927,
          zoom:12
        },
      });

      $scope.setMarkers = function(marker){
        angular.extend($scope,{
          center: {
            lat: $scope.oLat,
            lng: $scope.oLong,
            zoom:12
          },
          markers:{
            orig:{
              lat: $scope.oLat,
              lng: $scope.oLong,
              icon:{
                type: 'awesomeMarker',
                markerColor: 'blue'
              },
              draggable:false,
            },
            dest:{
              lat: $scope.dLat,
              lng: $scope.dLong,
              icon:{
                type: 'awesomeMarker',
                markerColor: 'red'
              },
              draggable:false,
            }
          }
        });
      };

      $scope.getCurrentPosition = function(){
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          leafletData.getMap().then(function(map){
            map.setView(new L.LatLng(pos.lat(), pos.lng()), 12);
          });
          geocoder.geocode( { 'latLng': pos}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK){
              $scope.oLat = results[0].geometry.location.lat();
              $scope.oLong = results[0].geometry.location.lng();
              $scope.currentRoute.startAddress = results[0].formatted_address;
              $scope.setMarkers();
              if($scope.currentRoute.encodedPolyline.length){
                $scope.getRoute();
              }
            }
          });
        });
      };

      $scope.getCurrentPosition();

      $scope.getRoute = function(){
        geocoder.geocode( { 'address': $scope.currentRoute.startAddress}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK){
            $scope.oLat = results[0].geometry.location.lat();
            $scope.oLong = results[0].geometry.location.lng();
            $scope.currentRoute.startAddress = results[0].formatted_address;

            geocoder.geocode( { 'address': $scope.currentRoute.endAddress}, function(results, status){
              if (status == google.maps.GeocoderStatus.OK){
                $scope.dLat = results[0].geometry.location.lat();
                $scope.dLong = results[0].geometry.location.lng();
                $scope.currentRoute.endAddress = results[0].formatted_address;
                $scope.currentRoute.saved = false;
                $scope.setMarkers();
                $scope.requestPath();
              }
            });
          }
        });
      };

      $scope.requestPath = function(){
        var start = new google.maps.LatLng($scope.oLat, $scope.oLong);
        var end = new google.maps.LatLng($scope.dLat, $scope.dLong);
        var request = {
          origin:start,
          destination:end,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(result, status){
          if (status == google.maps.DirectionsStatus.OK){
            console.debug(result.routes);
            $scope.currentRoute.encodedPolyline = result.routes[0].overview_polyline;
            $scope.drawPath();
          }
          else{
            alert("Não foi possível obter uma rota\n\nCódigo de resultado: " + status);
          }
        });
      };

      $scope.drawPath = function(){
        leafletData.getMap().then(function(map){
          if($scope.currentPolyline){
            map.removeLayer($scope.currentPolyline);
          }
          var path = L.Polyline.fromEncoded($scope.currentRoute.encodedPolyline).getLatLngs();
          $scope.currentPolyline = L.polyline(path, {color: '#4070ff', opacity:1.0,weight:7}).addTo(map);
          map.fitBounds($scope.currentPolyline.getBounds());
        });
      };

      $scope.saveRoute = function(){
        var i = 0;
        for (i = 0; i < $scope.savedRoutes.length; i++) {
          if($scope.savedRoutes[i].routename == $scope.currentRoute.routename){
            i = $scope.savedRoutes.length+1;
          }
        }
        if(i<$scope.savedRoutes.length+1){
          routeservice.saveRoute($scope.currentRoute).then(function(result){
            console.debug(result.data);
            $scope.currentRoute.saved = true;
            $scope.savedRoutes = result.data;
            $scope.currentRoute.routename = "";
          });
        }
        else{
          alert("Escolha um nome único para esta rota");
        }
      };

      $scope.listRoutes = function(){
        routeservice.listRoutes($rootScope.user).then(function(result){
          console.debug(result.data);
          $scope.savedRoutes = result.data;
        });
      };
      $scope.listRoutes();

      $scope.selectRoute = function(route){
        console.debug("selecionando rota");
        $scope.currentRoute = angular.copy(route);
        $scope.getRoute();
      };

      $scope.deleteRoute = function(routeIndex){
        routeservice.deleteRoute($scope.savedRoutes[routeIndex]).then(function(result){
          if(result.status == 200){
            $scope.savedRoutes.splice(routeIndex,1);
          }
        })
      };

      $scope.logout = function(){
        userservice.logout();
        $state.go('login');
      }

    }
  });
});
