var map;
var centerPoint={lat: 37.7749088,lng:-122.4894555};
var places=[];
var infoWindow;
var service;
var request;
var isSearching=false;
var limits={
	place:"San Francisco",
	type:"store"
};
var searchType=["store","","","","",""];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center:centerPoint,
      zoom:13,
      zoomControl: true,
	  mapTypeControl: false,
	  scaleControl: true,
	  streetViewControl: true,
	  rotateControl: true,
	  fullscreenControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    request = {
        location: map.getCenter(),
        query: '',
        radius:'1000',
        types: []
    };
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    function place(data,map) {
    	console.log(data);
        var self = this;
        self.formatted_address = data.formatted_address;
        self.name = data.name;
        self.place_id = data.place_id;
        self.geometry = data.geometry.location;
        self.marker = new google.maps.Marker({
            map: map,
            position: self.geometry
        });
        self.showDetail=function(){
            infoWindow.close() 
            toggleBounce(self.marker);
            setTimeout(function() {
                toggleBounce(self.marker);
                infoWindow.setContent(self.name+"<br/>"+self.formatted_address);
                infoWindow.open(map, self.marker);
            },500);
        }
        google.maps.event.addListener(self.marker, 'click', self.showDetail);
        self.clear=function(){
            self.marker.setMap(null);
        }
    }
    function searchPlace(request,_,map){
    	console.log(request)
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, function(results, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                places=results.map(function(i,index){
                    var tmp=new place(i,map);
                    setTimeout(function(){
                        tmp.marker.setAnimation(google.maps.Animation.DROP);
                    },index*200);
                    return tmp;
                })
                _.searchItems(places);
            }else{
                _.searchItems([]);
            }
        });
    }
    function MapViewModel() {
        var _=this;
        //toggle menu function use true and false to control the menu style
        _.showMenu = ko.observable(true);
        _.searchWord= ko.observable("");
        _.searchItems=ko.observableArray([]);
        _.toggleMenu = function(){
            _.showMenu(!this.showMenu());
        }
        _.popToPosition=function(item){
            console.log(item);
        };

        ko.computed(function(){
            places.forEach(function(i){
                i.clear();
            })
            if(_.searchWord()==="") { _.searchItems([]);}
            else{
            	request.types=[limits.type];
            	request.query=_.searchWord()+"|"+limits.place;searchPlace(request,_,map);
            }
        });
    }
    ko.applyBindings(new MapViewModel());
}


