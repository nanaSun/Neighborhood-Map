var map;
var centerPoint={lat: 37.7749088,lng:-122.4894555};
var markers = [];
var service;
var request;
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
      center:centerPoint,
      zoom:10
    });
    markers.push(new google.maps.Marker({
        map: map,
        draggable: true,
        position: centerPoint
    }));
    request = {
        location: map.getCenter(),
        radius: '500',
        query: ''
    };
    
    function MapViewModel() {
        var _=this;
        //toggle menu function use true and false to control the menu style
        _.showMenu = ko.observable(false);
        _.searchWord= ko.observable("");
        _.toggleMenu = function(){
            _.showMenu(!this.showMenu());
        }
        _.searchList =  ko.computed(function() {
            console.log(_.searchWord());
            if(_.searchWord()==="") return [];
            request.query=_.searchWord();
            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, function(results, status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    console.log(results);
                }
            });
        }, _);
    }
    ko.applyBindings(new MapViewModel());
}


