var apiURL = 'http://localhost:3000/api/snaps';

/* Vue for AJAX and templating */

// Component for displaying snaps
Vue.component('snap-item', {
  props: ['snap'],
  template: '<div> \
              <h1>{{snap.place}}</h1> \
              <p><b>Location: </b> {{snap.loc.coordinates[1]}}, {{snap.loc.coordinates[0]}} \
              <p><b>Likes: </b> {{snap.likes}} \
            </div>'
});

var app =  new Vue({
  el: '#app',

  data: {
    snaps: null,
    newSnap: {
      place: null,
      description: null,
      long: null,
      lat: null
    }
  },

  created: function() {
    this.fetchData();
  },

  methods: {
    getSnapsNear: function() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', apiURL + '/' + discoverMap.center.lng() + '/' + discoverMap.center.lat());
      xhr.onload = function() {
        console.log(JSON.parse(xhr.responseText));

        var points = JSON.parse(xhr.responseText);

        for(i=0;i<discoverMarkers.length;i++) {
          discoverMarkers[i].setMap(null);
        }

        discoverMarkers = [];

        for (i=0;i<points.length;i++) {
          var point = points[i]
          var marker = new google.maps.Marker({
            position: {lat: point.loc.coordinates[1], lng: point.loc.coordinates[0]},
            map: discoverMap,
            clickable: true
          })

          var snapString = '<div id="content">' +
                             '<h4>' + point.place + '</h4>' +
                             '<p>' + point.description + '</p>' +
                           '</div>';

          marker.info = new google.maps.InfoWindow({
            content: snapString
          });

          google.maps.event.addListener(marker, 'click', function() {
            marker.info.open(discoverMap, marker);
          });

          discoverMarkers.push(marker);
        }
      }

      xhr.send();
    },

    fetchData: function() {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL)
      xhr.onload = function() {
        self.snaps = JSON.parse(xhr.responseText);
      }

      xhr.send();
    },

    postData: function() {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', apiURL);
      xhr.setRequestHeader("Content-Type", "application/json");
      var self = this;
      xhr.onload = function() {
        var snap = JSON.parse(xhr.responseText);

        $('#newSnap').modal('toggle');
        self.getSnapsNear();

        // Reset form data
        self.newSnap.place = null;
        self.newSnap.description = null;
        self.newSnap.lat = null;
        self.newSnap.long = null;
      };

      xhr.send(JSON.stringify(
        {
          place: this.newSnap.place,
          description: this.newSnap.description,
          lat: this.newSnap.lat,
          long: this.newSnap.long
        }
      ));
    }
  }
});

/* Google Maps: New Snap Map */
var defaultCenter = {lat: 34.4140, lng: -119.8489};
var newSnapMap = new google.maps.Map(document.getElementById('newSnapMap'), {
  zoom: 17,
  center: defaultCenter,
  mapTypeId: 'hybrid'
});

var newSnapMarker = new google.maps.Marker({
  position: defaultCenter,
  map: newSnapMap
});

google.maps.event.addListener(newSnapMap, 'click', function(event) {
    newSnapMarker.setPosition(event.latLng);
    app.newSnap.long = event.latLng.lng();
    app.newSnap.lat = event.latLng.lat();
});

// Resize and recenter map when the modal is shown
$('#newSnap').on('shown.bs.modal', function () {
    var currCenter = newSnapMap.getCenter();
    google.maps.event.trigger(newSnapMap, 'resize');
    newSnapMap.setCenter(currCenter);
});

/* Google Maps: Snap Discover Map */
var discoverMap = new google.maps.Map(document.getElementById('discoverMap'), {
  zoom: 15,
  center: defaultCenter,
  mapTypeId: 'hybrid'
});

var discoverMarkers = [];

discoverMap.setOptions({disableDoubleClickZoom: true }); // Prevent double click from zooming in
google.maps.event.addListener(discoverMap, 'dblclick', function(event) {
  newSnapMarker.setPosition(event.latLng);
  app.newSnap.long = event.latLng.lng();
  app.newSnap.lat = event.latLng.lat();

  newSnapMap.setCenter(event.latLng);
  $('#newSnap').modal('toggle');
});

google.maps.event.addListener(discoverMap, 'dragend', function(event) {
    app.getSnapsNear();
});

// Center new snap map after Vue and Maps are set up
app.newSnap.long = defaultCenter.lng;
app.newSnap.lat = defaultCenter.lat;

  app.getSnapsNear();
