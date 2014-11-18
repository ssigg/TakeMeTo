angular.module('takeMeTo.factories', ['ngGeolocation'])

// Gets data from different web services.
// ==========================================================================
.factory('webservices', ['$q', '$http', function($q, $http) {
    function getBestStationByQuery(query) {
        var url = 'http://maps.google.com/maps/api/geocode/json?address=' + query;
        return $http.get(url).then(function(geoCodeResult) {
            var lat = geoCodeResult.data.results[0].geometry.location.lat;
            var lng = geoCodeResult.data.results[0].geometry.location.lng;
            return getBestStationByCoordinates(lat, lng);
        });
    }
    
    function getBestStationByCoordinates(lat, lng) {
        var url = 'http://maps.google.com/maps/api/geocode/json?latlng=' + lat + ',' + lng;
        return $http.get(url).then(function(geoCodeResult) {
            var address = geoCodeResult.data.results[0].formatted_address;
            return _getBestStationByAddress(address);
        });
    }
    
    function getConnections(lat, lng, destination, limit, date) {
        return $q.all([
                getBestStationByCoordinates(lat, lng),
                getBestStationByQuery(destination)])
            .then(function(aggregate) {
                var from = aggregate[0].name;
                var to = aggregate[1].name;
                var url = 'http://transport.opendata.ch/v1/connections?from=' + from + '&to=' + to + '&limit=' + limit;
                if (date !== undefined) {
                    var dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                    var timeString = date.getHours() + ':' + date.getMinutes();
                    url = url + '&isArrivalTime=1&date=' + dateString + '&time=' + timeString;
                }
                return $http.get(url).then(function(connections) {
                    return connections.data;
                });
        });
    }
    
    function getConnectionsToNextEvent(lat, lng, icsUrl, limit) {
        return $http.get(icsUrl).then(function(result) {
            var events = ical.parseICS(result.data);
            var nextEvent = undefined;
            for (var key in events) {
                if (events.hasOwnProperty(key)) {
                    var event = events[key];
                    if (event.start > new Date() &&
                        (nextEvent === undefined || nextEvent.start > event.start) &&
                        event.location != undefined &&
                        event.location != '') {
                        nextEvent = event;
                    }
                }
            }
            return nextEvent !== undefined ? getConnections(lat, lng, nextEvent.location, limit, nextEvent.start) : { };
        });
    }
    
    function _getBestStationByAddress(address) {
        var urlByAddress = 'http://transport.opendata.ch/v1/locations?query=' + address + '&type=address';
        var urlByStation = 'http://transport.opendata.ch/v1/locations?query=' + address + '&type=station';
        return $q.all([$http.get(urlByAddress), $http.get(urlByStation)])
            .then(function(aggregate) {
                if (aggregate[0].data.stations.length > 0) {
                    return aggregate[0].data.stations[0];
                } else if (aggregate[1].data.stations.length > 0) {
                    return aggregate[1].data.stations[0];
                }
                return null;
            });
    }
    
    return {
        BestStationByQuery: getBestStationByQuery,
        BestStationByCoordinates: getBestStationByCoordinates,
        Connections: getConnections,
        ConnectionsToNextEvent: getConnectionsToNextEvent
    };
}])