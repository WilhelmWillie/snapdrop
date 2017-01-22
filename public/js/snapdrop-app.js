var apiURL = '/api/snaps';

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

Vue.component('current-snap', {
  props: ['snap'],
  template: '<div class="snapView"> \
              <div class="container-fluid">\
                <div class="row">\
                  <div class="col-md-8">\
                    <img :src="\'/images/uploads/\' + snap.file" class="img-thumbnail img-responsive" />\
                  </div>\
                  <div class="col-md-4">\
                    <p class="photographer"><b>By:</b> {{snap.photographer}}</p>\
                    <p>{{snap.description}}</p>\
                    <hr>\
                    <div class="tags">\
                      <span class="label label-default" v-for="tag in snap.tags">{{tag}}</span>\
                    </div>\
                    <hr>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>'
})

var app =  new Vue({
  el: '#app',

  data: {
    snaps: null,
    newSnap: {
      place: null,
      description: null,
      long: null,
      lat: null
    },
    currentSnap: null,
    newComment: null
  },

  created: function() {
    this.fetchData();
  },

  methods: {
    getSnapsNear: function() {
      var xhr = new XMLHttpRequest();
      console.log(discoverMap);
      // xhr.open('GET', apiURL + '/' + discoverMap.center.lng() + '/' + discoverMap.center.lat());
      xhr.open('GET', apiURL + '/' +
          discoverMap.getBounds().getSouthWest().lng() + '/' +
          discoverMap.getBounds().getSouthWest().lat() + '/' +
          discoverMap.getBounds().getNorthEast().lng() + '/' +
          discoverMap.getBounds().getNorthEast().lat()
        );

      xhr.onload = function() {
        console.log(JSON.parse(xhr.responseText));

        var points = JSON.parse(xhr.responseText);

        for(i=0;i<discoverMarkers.length;i++) {
          discoverMarkers[i].setMap(null);
        }

        discoverMarkers = [];

        for (i=0;i<points.length;i++) {
          addMarker(points[i]);
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
      var file = document.getElementById('imgInput').files[0];

      var formData = new FormData();
      formData.append('place', this.newSnap.place);
      formData.append('photographer', this.newSnap.photographer);
      formData.append('description', this.newSnap.description);
      formData.append('tags', this.newSnap.tags);
      formData.append('lat', this.newSnap.lat);
      formData.append('long', this.newSnap.long);
      formData.append('file', file);

      var self = this;

      $.ajax({
        type: 'POST',
        url: apiURL,
        data: formData,
        cache: false,
        enctype: 'multipart/form-data',
        contentType: false,
        processData: false,
        success: function(data) {
          $('#newSnap').modal('toggle');

          discoverMap.setCenter({
            lat: self.newSnap.lat,
            lng: self.newSnap.long
          });

          // Reset form data
          self.newSnap.place = null;
          self.newSnap.photographer = null;
          self.newSnap.description = null;
          self.newSnap.lat = null;
          self.newSnap.long = null;
          document.getElementById('imgInput').value = null;

          self.getSnapsNear();          
        },
        error: function(data) {

        }
      })
      /*
      var xhr = new XMLHttpRequest();
      xhr.open('POST', apiURL);
      xhr.setRequestHeader("content-type","multipart/form-data; charset=utf-8; boundary=" + Math.random().toString().substr(2));
      var self = this;
      xhr.onload = function() {
        console.log(xhr.responseText);
        var snap = JSON.parse(xhr.responseText);

        $('#newSnap').modal('toggle');
        self.getSnapsNear();

        // Reset form data
        self.newSnap.place = null;
        self.newSnap.description = null;
        self.newSnap.lat = null;
        self.newSnap.long = null;
      };

      xhr.send(formData);
      */
    },

    setSnap: function(snap) {
      this.currentSnap = snap;
      window.location.hash = snap._id;
    },

    comment: function() {
      alert(this.newComment);
    }
  }
});

/* Helper functions */
function addMarker(point) {
  var marker = new google.maps.Marker({
    position: {lat: point.loc.coordinates[1], lng: point.loc.coordinates[0]},
    map: discoverMap,
    clickable: true,
    icon: '/images/pin.png'
  })

  var snapString = '<div id="content" class="text-center">' +
                     '<h4>' + point.place + '</h4>' +
                     '<img src="/images/uploads/' + point.file + '" class="img-thumbnail img-preview" /><br><br>' +
                     '<a class="btn btn-md btn-primary" data-toggle="modal" data-target="#viewSnap">See More</button><br>' +
                   '</div>';

  marker.info = new google.maps.InfoWindow({
    content: snapString,
    maxWidth: 200
  });

  google.maps.event.addListener(marker, 'click', function() {
    marker.info.open(discoverMap, marker);
    app.setSnap(point);
  });

  discoverMarkers.push(marker);
}

/* Google Maps: New Snap Map */
var defaultCenter = {lat: 34.0407, lng: -118.2468};
var newSnapMap = new google.maps.Map(document.getElementById('newSnapMap'), {
  zoom: 17,
  center: defaultCenter,
  mapTypeId: 'hybrid'
});

var newSnapMarker = new google.maps.Marker({
  position: defaultCenter,
  map: newSnapMap,
  icon: '/images/pin.png'
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

/* Google Maps: Discover Search Bar */
var searchInput = document.getElementById('mapSearch');
var searchBox = new google.maps.places.SearchBox(searchInput);

searchBox.addListener('places_changed', function() {
  var places = searchBox.getPlaces();

  if (places.length == 0) {
    return;
  }

  // Go to the first place and set center
  discoverMap.setCenter({
    lat: places[0].geometry.location.lat(),
    lng: places[0].geometry.location.lng()
  });

  app.getSnapsNear();
});

// Center new snap map after Vue and Maps are set up
app.newSnap.long = defaultCenter.lng;
app.newSnap.lat = defaultCenter.lat;

// app.getSnapsNear();

google.maps.event.addListener(discoverMap, 'tilesloaded', function() {
  app.getSnapsNear();
});
