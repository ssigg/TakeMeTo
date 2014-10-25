angular.module('takeMeTo.factories', ['ngGeolocation'])

// Gets data from different web services.
// ==========================================================================
.factory('webservices', ['$q', '$http', function($q, $http) {    
    function getBestStationByAddress(address) {
        // TODO: If no address can be found, check via google:
        // * What the coordinates of the address are
        // * Then use getBestStationByCoordinates(lat, lng)
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
    
    function getBestStationByCoordinates(lat, lng) {
        var url = 'http://maps.google.com/maps/api/geocode/json?latlng=' + lat + ',' + lng;
        return $http.get(url).then(function(geoCodeResult) {
            var address = geoCodeResult.data.results[0].formatted_address;
            return getBestStationByAddress(address);
        });
    }
    
    function getConnections(lat, lng, destination, limit, date) {
        return $q.all([
                getBestStationByCoordinates(lat, lng),
                getBestStationByAddress(destination)])
            .then(function(aggregate) {
                var from = aggregate[0].name;
                var to = aggregate[1].name;
                var url = 'http://transport.opendata.ch/v1/connections?from=' + from + '&to=' + to + '&limit=' + limit;
                if (date !== undefined) {
                    var dateString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay();
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
            var events = result.data.VCALENDAR.VEVENT;
            for (var i = 0; i < events.length; i += 1) {
                var date = new Date(_DTSTAMP2Date(events[i].DTSTAMP));
                if (date > new Date()) {
                    return getConnections(lat, lng, events[i].LOCATION, limit, date);
                }
            }
            return { };
        });
    }
    
    function _DTSTAMP2Date(DTSTAMP)  {
        // icalStr = '20110914T184000Z'
        var strYear = DTSTAMP.substr(0,4);
        var strMonth = DTSTAMP.substr(4,2);
        var strDay = DTSTAMP.substr(6,2);
        var strHour = DTSTAMP.substr(9,2);
        var strMin = DTSTAMP.substr(11,2);
        var strSec = DTSTAMP.substr(13,2);
        return new Date(strYear,strMonth, strDay, strHour, strMin, strSec);
    }
    
    return {
        BestStationByAddress: getBestStationByAddress,
        BestStationByCoordinates: getBestStationByCoordinates,
        Connections: getConnections,
        ConnectionsToNextEvent: getConnectionsToNextEvent
    };
}])