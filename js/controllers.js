angular.module('takeMeTo.controllers', ['ngRoute', 'angularLocalStorage', 'ngGeolocation', 'ngTouch', 'ui.bootstrap', 'takeMeTo.factories', 'takeMeTo.directives'])

// Convert timestamp to time.
// ==========================================================================
.filter('dateFromTimestamp', function myDateFormat($filter){
  return function(timestamp){
    return new Date(timestamp * 1000);
  }
})

// Search form and connection list.
// ==========================================================================
.controller('ConnectionListController', ['$q', '$scope', '$routeParams', '$geolocation', 'webservices', 'storage',
    function($q, $scope, $routeParams, $geolocation, webservices, storage) {
        $scope.data = [];
        $scope.data.destination = $routeParams.destination;
        $scope.data.connections = [];
        $scope.data.currentConnectionIndex = 0;
        $scope.data.errors = [];
        $scope.data.loading = false;
        
        $scope.find = function(destination) {
            window.location.hash = '/' + destination;
            $scope.loadConnections(destination);
        }
        
        $scope.home = function() {
            var homeAddress = storage.get('homeAddress');
            window.location.hash = '/' + homeAddress;
            $scope.loadConnections(homeAddress);
        };
        
        $scope.loadConnections = function(destination) {
            $scope.data.connections = [];
            $scope.data.errors = [];
            $scope.data.loading = true;
            $geolocation.getCurrentPosition({ timeout: 100000 }).then(function(geoPosition) {
                var lat = geoPosition.coords.latitude;
                var lng = geoPosition.coords.longitude;
                webservices.Connections(lat, lng, destination, 4)
                    .then(function(result) {
                        $scope.data.connections = result.connections;
                    })
                    .catch(function(error) {
                        var message = 'Problem with URL ' + error.config.url;
                        $scope.data.errors.push(message);
                    })
                    .finally(function() {
                        $scope.data.loading = false;
                    })
            });
        };
        
        $scope.displayNextConnection = function() {
            var numberOfConnections = $scope.data.connections.length;
            $scope.data.currentConnectionIndex = ($scope.data.currentConnectionIndex + numberOfConnections + 1) % numberOfConnections;
        };
        
        $scope.displayPreviousConnection = function() {
            var numberOfConnections = $scope.data.connections.length;
            $scope.data.currentConnectionIndex = ($scope.data.currentConnectionIndex + numberOfConnections - 1) % numberOfConnections;
        };
        
        $scope.nextEvent = function() {
            $scope.data.connections = [];
            $geolocation.getCurrentPosition({ timeout: 100000 })
                .then(function(geoPosition) {
                    var lat = geoPosition.coords.latitude;
                    var lng = geoPosition.coords.longitude;
                    webservices.ConnectionsToNextEvent(lat, lng, 'http://localhost:4567/data/events.json', 4)
                        .then(function(result) {
                            $scope.data.connections = result.connections;
                        })
                        .catch(function(errors) {
                            var message = '';
                            for (var i = 0; i < errors.length; i += 1) {
                                message = message + '\n' + errors[i].message;
                            }
                            alert('Oh noo!\n' + message);
                        })
                        .finally(function() {
                            $scope.data.status = [];
                        });
            });
        };
        
        $scope.reload = function() {
            location.reload();
        };
        
        if ($scope.data.destination != undefined) {
            $scope.loadConnections($scope.data.destination);
        }
    }
])

// Settings.
// ==========================================================================
.controller('SettingsController', ['$scope', 'storage', function($scope, storage) {
    $scope.data = [];
    $scope.data.homeAddress = storage.get('homeAddress');
    
    $scope.set = function(key, value) {
        storage.set(key, value);
    };
}])

// Routes.
// ==========================================================================
.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'ConnectionListController',
            templateUrl: 'templates/connectionlist.html'
        })
        .when('/settings', {
            controller: 'SettingsController',
            templateUrl: 'templates/settings.html'
        })
        .when('/:destination', {
            controller: 'ConnectionListController',
            templateUrl: 'templates/connectionlist.html'
        })
        .when('/:destination/:index', {
            controller: 'ConnectionDetailController',
            templateUrl: 'templates/connectionDetail.html'
        })
});