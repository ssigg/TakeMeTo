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
    
    it('BestStationByQuery takes the address response if address and station response present', inject(function(webservices) {
        var coordinatesResult = {results: [{geometry: {location:{lat: 0, lng: 0}}}]};
        var geocodingResult = {results: [{formatted_address: 'testAddress'}]};
        var addressResponse = { stations: [ { name: 'A' } ] };
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?address=testAddress')
            .respond(200, coordinatesResult);
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geocodingResult);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var station = {};
        webservices.BestStationByQuery('testAddress').then(function(result) { station = result; });
        expect(station).toEqual({});
        
        $httpBackend.flush();
        expect(station).toEqual(addressResponse.stations[0]);
    }));
    
    it('BestStationByQuery forwards failure from coordinate call', inject(function(webservices) {
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?address=testAddress')
            .respond(500);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByQuery('testAddress')
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
    
    it('BestStationByQuery forwards failure from geocode call', inject(function(webservices) {
        var coordinatesResult = {results: [{geometry: {location:{lat: 0, lng: 0}}}]};
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?address=testAddress')
            .respond(200, coordinatesResult);
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(500);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByQuery('testAddress')
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
    
    it('BestStationByQuery forwards failure from transport address call', inject(function(webservices) {
        var coordinatesResult = {results: [{geometry: {location:{lat: 0, lng: 0}}}]};
        var geocodingResult = {results: [{formatted_address: 'testAddress'}]};
        var stationsResponse = { stations: [ { name: 'B' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?address=testAddress')
            .respond(200, coordinatesResult);
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geocodingResult);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(500);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(200, stationsResponse);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByQuery('testAddress')
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
    
    it('BestStationByQuery forwards failure from transport station call', inject(function(webservices) {
        var coordinatesResult = {results: [{geometry: {location:{lat: 0, lng: 0}}}]};
        var geocodingResult = {results: [{formatted_address: 'testAddress'}]};
        var addressResponse = { stations: [ { name: 'A' } ] };
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?address=testAddress')
            .respond(200, coordinatesResult);
        $httpBackend
            .expectGET('http://maps.google.com/maps/api/geocode/json?latlng=0,0')
            .respond(200, geocodingResult);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=address')
            .respond(200, addressResponse);
        $httpBackend
            .expectGET('http://transport.opendata.ch/v1/locations?query=testAddress&type=station')
            .respond(500);
        
        var status = 0;
        var data = undefined;
        webservices.BestStationByQuery('testAddress')
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
});