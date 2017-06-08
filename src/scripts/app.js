var map,
	centerPoint={lat: 37.77493,lng: -122.41942},//initial center point
	places=[],
	infoWindow,
	service,
	request,
	isSearching=false;
//after google map api loaded, run this function
function initMap() {
	//init map
    map = new google.maps.Map(document.getElementById('map'), {
      center:centerPoint,
      zoom:10,
      zoomControl: true,
	  mapTypeControl: false,
	  scaleControl: true,
	  streetViewControl: true,
	  rotateControl: true,
	  fullscreenControl: false
    });
    //init infoWindow
    infoWindow = new google.maps.InfoWindow();
    //init service
    service = new google.maps.places.PlacesService(map);

    //marker animation
    function markerBounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            marker.setAnimation(null);
        },1400);
    }

    //place detail window
    function infoPanel(data){
            return data.name+"<br/>"+data.location.display_address.join(",")+"<br/>";
    }

    //each place function
    function place(data,map) {
        var _ = this;
        _.data=data;
        _.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(_.data.coordinates.latitude, _.data.coordinates.longitude)
        });
        _.marker.setMap(map);
        
        console.log(_.marker);
        _.showDetail=function(){
            map.setCenter(new google.maps.LatLng(_.data.coordinates.latitude, _.data.coordinates.longitude));
            map.setZoom(15);
            infoWindow.close();
            console.log(_.data);
            infoWindow.setContent(infoPanel(_.data));
            infoWindow.open(map, _.marker);
        };

        //show info with animation
        _.clickMarkerDetail=function(){
            markerBounce(_.marker);
            _.showDetail();
        };
        google.maps.event.addListener(_.marker, 'click', _.clickMarkerDetail);

        //clear marker on the map
        _.clear=function(){
            _.marker.setMap(null);
        };
    }

    //search place service
    function searchPlace(request,callback){
        return $.ajax({
            url: "http://localhost:8888",
            data:request,
            type: 'POST',
            success: function(data) {
                if("error" in data){
                    alert("system error");
                    return;
                }
                callback(data);
            },
            fail:function(data){
                alert("system error");
            }
        });
    }


    //main model function
    function MapViewModel() {
        var _=this;
        var searchajax=null;
        //toggle menu function use true and false to control the menu style
        _.showMenu = ko.observable(true);
        //toggle filter div
        _.showChooseType = ko.observable(false);
        //filter item
        _.typeItems=ko.observableArray(["store","bar","bank","hospital","atm"]);
        //search keyword
        _.searchWord= ko.observable("");

        //after search items
        _.searchItems=ko.observableArray([]);

        //init search type
        _.type=ko.observable("store");

        _.toggleMenu = function(){
            _.showMenu(!this.showMenu());
        };
        _.chooseType=function(data){
        	_.type(data);
        };
        _.toggleChooseType=function(){
        	_.showChooseType(!this.showChooseType());
        };
        ko.computed(function(){
            if(searchajax!==null) searchajax.abort();
            _.searchItems([]);
            places.forEach(function(i){
                i.clear();
            });
            map.setCenter(centerPoint);
            map.setZoom(13);
            if(_.searchWord()==="") { 
                request = {
                    "action":"s",
                    "location": "San fransaco",
                    "limit": 10
                };
            	searchajax=searchPlace(request,function(data){
                    places=data.businesses.map(function(i){
                        return new place(i,map);
                    });
                    _.searchItems(places);
                });
            }else{
                request = {
                    "action":"s",
                    "name":_.searchWord(),
                    "location": "San fransaco",
                    "limit": 10
                };
                searchajax=searchPlace(request,function(data){
                    places=data.businesses.map(function(i){
                        return new place(i,map);
                    });
                    _.searchItems(places);
                });
            }
        });
    }

    //bind with view
    ko.applyBindings(new MapViewModel());
}

