describe('takeMeTo.factories', function() {
    var $httpBackend;
    
    beforeEach(module('takeMeTo.factories'));
    
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    it('BestStationByAddress takes the address response if address and station response present', inject(function(webservices) {
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByAddress('testAddress').then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(addressResponse.stations[0]);
    }));
    
    it('BestStationByAddress takes the address response if only address response present', inject(function(webservices) {
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationsResponse = { stations: [] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByAddress('testAddress').then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(addressResponse.stations[0]);
    }));
    
    it('BestStationByAddress takes the station response if only station response present', inject(function(webservices) {
        var addressResponse = { stations: [] };
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByAddress('testAddress').then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(stationsResponse.stations[0]);
    }));
    
    it('BestStationByAddress takes the station response if only station response present', inject(function(webservices) {
        var addressResponse = { stations: [] };
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByAddress('testAddress').then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(stationsResponse.stations[0]);
    }));
    
    it('BestStationByAddress forwards failure from address call', inject(function(webservices) {
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(500);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByAddress('testAddress')
            .catch(function(result) {
                status = result.status;
                data = result.data;
            });
        expect(status).toEqual(0);
        expect(data).toEqual(undefined);
        
        $httpBackend.flush();
        expect(status).toEqual(500);
        expect(data).toEqual(undefined);
    }));
    
    it('BestStationByAddress forwards failure from station call', inject(function(webservices) {
        var addressResponse = { stations: [ { name: 'A' } ] };
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(500);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByAddress('testAddress')
            .catch(function(result) {
                status = result.status;
                data = result.data;
            });
        expect(status).toEqual(0);
        expect(data).toEqual(undefined);
        
        $httpBackend.flush();
        expect(status).toEqual(500);
        expect(data).toEqual(undefined);
    }));
    
    it('BestStationByCoordinates uses google and then transport api', inject(function(webservices) {
        var geoCodeResponse = { results: [ { formatted_address: 'geocoded address' } ] };
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geoCodeResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByCoordinates(0, 0).then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(addressResponse.stations[0]);
    }));
    
    it('BestStationByCoordinates forwards failure from google', inject(function(webservices) {
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(500);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByCoordinates(0, 0)
            .catch(function(result) {
                status = result.status;
                data = result.data;
            });
        expect(status).toEqual(0);
        expect(data).toEqual(undefined);
        
        $httpBackend.flush();
        expect(status).toEqual(500);
        expect(data).toEqual(undefined);
    }));
    
    it('Connections uses google and then transport api', inject(function(webservices) {
        var geoCodeResponse = { results: [ { formatted_address: 'geocoded address' } ] };
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationResponse = { stations: [ { name: 'B' } ] };
        var connectionsResponse = { connections: [ { from: 'A', to: 'A' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geoCodeResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=address&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=address&type=station')
            .respond(200, stationResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=station')
            .respond(200, stationResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/connections?from=A&to=A&limit=1')
            .respond(200, connectionsResponse);
        
        var connections = {};
        webservices.Connections(0, 0, 'address', 1).then(function(result) { connections = result; });
        expect(connections).toEqual({});
        
        $httpBackend.flush();
        expect(connections).toEqual(connectionsResponse);
    }));
    
    it('Connections uses transport api for destination and forwards failure from google', inject(function(webservices) {
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(500);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=address&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=address&type=station')
            .respond(200, stationResponse);
        
        var status = 0;
        var data = undefined;
        webservices.Connections(0, 0, 'address', 1)
            .catch(function(result) {
                status = result.status;
                data = result.data;
            });
        expect(status).toEqual(0);
        expect(data).toEqual(undefined);
        
        $httpBackend.flush();
        expect(status).toEqual(500);
        expect(data).toEqual(undefined);
    }));
    
    it('AddressOfNextEvent returns address of event which occurs next', inject(function(webservices) {
        var geoCodeResponse = { results: [ { formatted_address: 'geocoded address' } ] };
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationResponse = { stations: [ { name: 'B' } ] };
        var connectionsResponse = { connections: [ { from: 'A', to: 'A' } ] };
        var calendarResponse = {
            VCALENDAR: {
                VEVENT: [{
                    DTSTAMP: '20110328T203000',
                    LOCATION: 'calendar address 1'
                }, {
                    DTSTAMP: '30000101T120000',
                    LOCATION: 'calendar address 2'
                }]
            }
        };
        
        var calendarUrl = 'http://calendarurl.com';
        $httpBackend
            .expectGET(calendarUrl)
            .respond(200, calendarResponse);
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geoCodeResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=calendar address 2&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=calendar address 2&type=station')
            .respond(200, stationResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=geocoded address&type=station')
            .respond(200, stationResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/connections?from=A&to=A&limit=4&isArrivalTime=1&date=3000-1-6&time=12:0')
            .respond(200, connectionsResponse);
        
        var connections = [];
        webservices.ConnectionsToNextEvent(0, 0, calendarUrl, 4).then(function(result) { connections = result; });
        expect(connections).toEqual([]);
        
        $httpBackend.flush();
        expect(connections).toEqual(connectionsResponse);
    }));
    
    it('AddressOfNextEvent returns nothing if no event is after current time', inject(function(webservices) {
        var calendarResponse = {
            VCALENDAR: {
                VEVENT: [{
                    DTSTAMP: '20110328T203000',
                    LOCATION: 'calendar address 1'
                }, {
                    DTSTAMP: '20110401T120000',
                    LOCATION: 'calendar address 2'
                }]
            }
        };
        var calendarUrl = 'http://calendarurl.com';
        
        $httpBackend
            .expectGET(calendarUrl)
            .respond(200, calendarResponse);
        
        var event = { };
        webservices.ConnectionsToNextEvent(0, 0, calendarUrl, 4).then(function(result) { event = result; });
        expect(event).toEqual({ });
        
        $httpBackend.flush();
        expect(event).toEqual({ });
    }));
});