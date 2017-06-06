var map;
var centerPoint={lat: 37.7749088,lng:-122.4894555};
var places=[];
var infoWindow;
var service;
var request;
var isSearching=false;
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
        radius:'1000',
        types: []
    };
    function markerBounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            marker.setAnimation(null);
        },1400);
    }
    function infoPanel(data){
        if(typeof data.photos!=="undefined"&&data.photos.length>0){return '<img src="'+data.photos[0].getUrl({'maxWidth': 120})+'"/>'+data.name+"<br/>"+data.formatted_address+"<br/>";}
        else{
            return data.name+"<br/>"+data.formatted_address+"<br/>";
        }
        
    }
    function place(data,map) {
        var self = this;
        self.data=data;
        self.marker = new google.maps.Marker({
            map: map,
            position: data.geometry.location
        });
        self.showDetail=function(){
            map.setCenter(self.data.geometry.location);
            map.setZoom(15);
            infoWindow.close() 
            markerBounce(self.marker);
            infoWindow.setContent(infoPanel(self.data));
            infoWindow.open(map, self.marker);
        }
        google.maps.event.addListener(self.marker, 'click', self.showDetail);
        self.clear=function(){
            self.marker.setMap(null);
        }
    }
    function searchPlace(request,_,map){
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, function(results, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                places=results.map(function(i,index){
                    var tmp=new place(i,map);
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
        _.showChooseType = ko.observable(false);
        _.typeItems=ko.observableArray(["store","bar","bank","hospital","atm"]);
        _.searchWord= ko.observable("");
        _.searchItems=ko.observableArray([]);
        _.type=ko.observable("store");
        _.mainplace=ko.observable("San Francisco");
        _.toggleMenu = function(){
            _.showMenu(!this.showMenu());
        }
        _.chooseType=function(data){
        	_.type(data);
        }
        _.toggleChooseType=function(){
        	_.showChooseType(!this.showChooseType());
        }
        ko.computed(function(){
            places.forEach(function(i){
                i.clear();
            });
            map.setCenter(centerPoint);
            map.setZoom(13);
            if(_.searchWord()==="") { 
            	request.types=_.typeItems();searchPlace(request,_,map);
            }else{
            	request.types=[_.type()];
            	request.query=_.searchWord()+"|"+_.mainplace();searchPlace(request,_,map);
            }
        });
    }
    ko.applyBindings(new MapViewModel());
}


