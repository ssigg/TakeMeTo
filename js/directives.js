angular.module('takeMeTo.directives', [])

// usage: <ng-directions origin="lat,lng" destination="lat,lng" />
.directive('ngDirections', ['$q', function($q) {
    function _initialize(element, start, end) {
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var options = {
            disableDoubleClickZoom: true,
            draggable: false,
            scrollwheel: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false
        };
        var map = new google.maps.Map(element, options);
        directionsDisplay.setMap(map);

        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.TravelMode.WALKING,
            
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    };
    
    function _create(scope, element, attrs) {
        var start = attrs.origin;
        var end = attrs.destination;
        _initialize(element.children(0)[0], start, end);
    };
    
    return {
        restrict: 'E',
        template: '<div class="map"></div>',
        link: _create
    };
}]);