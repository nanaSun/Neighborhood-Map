var map,
    centerPoint = { lat: 37.77493, lng: -122.41942 }, //initial center point
    places = [],
    infoWindow,
    service,
    request,
    init = false;
//after google map api loaded, run this function
function initMap() {
    //init map
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPoint,
        zoom: 13,
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
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }

    //place detail window
    function infoPanel(data) {
        return "<img src='" + data.image_url + "' width='40px'/>" + "<br/>" + (!data.isclose ? "opening" : "closed") + "<br/>" + "phone: " + data.phone + "<br/>" + data.name + "<br/>" + data.location.display_address.join(",") + "<br/>";
    }

    //each place function
    function placeItem(data, map) {
        var _ = this;
        _.data = data;
        _.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(_.data.coordinates.latitude, _.data.coordinates.longitude)
        });
        _.showDetail = function() {
            map.setCenter(new google.maps.LatLng(_.data.coordinates.latitude, _.data.coordinates.longitude));
            map.setZoom(15);
            infoWindow.close();
            infoWindow.setContent(infoPanel(_.data));
            infoWindow.open(map, _.marker);
        };

        //show info with animation
        _.clickMarkerDetail = function() {
            markerBounce(_.marker);
            _.showDetail();
        };
        google.maps.event.addListener(_.marker, 'click', _.clickMarkerDetail);

        //clear marker on the map
        _.clear = function() {
            _.marker.setVisible(false);
        };
        _.show = function() {
            _.marker.setVisible(true);
        };
        _.show();
    }

    //search place service
    function searchPlace(request, callback) {
        return $.ajax({
            url: "http://localhost:8888",
            data: request,
            type: 'POST',
            success: function(data) {
                if ("error" in data) {
                    alert("system error");
                    return;
                }
                callback(data);
            },
            error: function(data) {
                alert("init data fail");
            }
        });
    }

    //filter item
    function filterPlace(items, filterWord) {

    }

    //main model function
    function MapViewModel() {
        var _ = this;
        //toggle menu function use true and false to control the menu style
        _.showMenu = ko.observable(true);
        //search keyword
        _.searchWord = ko.observable("");

        //after search items
        _.searchItems = ko.observableArray([]);

        //init search type
        _.type = ko.observable("store");

        _.toggleMenu = function() {
            _.showMenu(!this.showMenu());
        };

        //init data
        request = {
            "action": "s",
            "location": "San fransaco",
            "limit": 50
        };
        searchPlace(request, function(data) {
            init = true;
            places = data.businesses.map(function(i) {
                return new placeItem(i, map);
            });

            //init filter function after data is ready
            _.searchItems(places);
            ko.computed(function() {
                var filter = _.searchWord().toLowerCase();
                if (filter === "") {
                    places.forEach(function(i) {
                        i.show();
                    });
                    _.searchItems(places);
                } else {
                    _.searchItems(ko.utils.arrayFilter(places, function(item) {
                        if (item.data.name.toLowerCase().indexOf(filter) >= 0) {
                            item.show();
                            return true;
                        } else {
                            item.clear();
                            return false;
                        }
                    }));
                }
            });
        });

    }

    //bind with view
    ko.applyBindings(new MapViewModel());
}
