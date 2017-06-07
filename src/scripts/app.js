var map,
	centerPoint={lat: 35.0153,lng:135.7682},//initial center point
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
      zoom:13,
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

    //search init params
    request = {
        location: map.getCenter(),
        radius:'5000',
        types: []
    };

    //marker animation
    function markerBounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            marker.setAnimation(null);
        },1400);
    }

    //place detail window
    function infoPanel(data){

        if(typeof data.photos!=="undefined"&&data.photos.length>0){
            return '<img src="'+data.photos[0].getUrl({'maxWidth': 120})+'"/><br/>'+data.name+"<br/>"+data.formatted_address+"<br/>";}
        else{
            return data.name+"<br/>"+data.formatted_address+"<br/>";
        }
        
    }

    //each place function
    function place(data,map) {
        var _ = this;
        _.data=data;
        _.marker = new google.maps.Marker({
            map: map,
            position: data.geometry.location
        });

        _.showDetail=function(){
            map.setCenter(_.data.geometry.location);
            map.setZoom(15);
            infoWindow.close();
            service.getDetails(_.data, function(result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }
                infoWindow.setContent(infoPanel(_.data));
                infoWindow.open(map, _.marker);
            });
            $.ajax( {
                url: "https://jp.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles="+_.data.name,
                dataType: 'jsonp',
                type: 'GET',
                headers: { 'Api-User-Agent': 'Example/1.0' },
                success: function(data) {
                   console.log(data.query.pages['2455254'].revisions[0]['*']);
                    infoWindow.setContent(infoPanel(data.query.pages['2455254'].revisions[0]['*']));
                }
            } );
            // infoWindow.setContent(infoPanel(_.data));
            // infoWindow.open(map, _.marker);
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
    function searchPlace(request,_,map){
        service.textSearch(request, function(results, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                places=results.map(function(i,index){
                    var tmp=new place(i,map);
                    return tmp;
                });
                _.searchItems(places);
            }else{
                _.searchItems([]);
            }
        });
    }
    //search place service
    function searchNearByPlace(request,_,map){
        service.nearbySearch(request, function(results, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                places=results.map(function(i,index){
                    var tmp=new place(i,map);
                    return tmp;
                });
                _.searchItems(places);
            }else{
                _.searchItems([]);
            }
        });
    }


    //main model function
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
        };
        _.chooseType=function(data){
        	_.type(data);
        };
        _.toggleChooseType=function(){
        	_.showChooseType(!this.showChooseType());
        };
        ko.computed(function(){
            _.searchItems([]);
            places.forEach(function(i){
                i.clear();
            });
            map.setCenter(centerPoint);
            map.setZoom(13);
            if(_.searchWord()==="") { 
            	request.types=_.typeItems();searchNearByPlace(request,_,map);
            }else{
            	request.types=[_.type()];
            	request.query=_.searchWord()+"|"+_.mainplace();searchPlace(request,_,map);
            }
        });
    }

    //bind with view
    ko.applyBindings(new MapViewModel());
}


