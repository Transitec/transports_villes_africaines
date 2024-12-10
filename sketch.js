const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA'
  
const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([ 30.0618851, -1.9440727 ], 5);


fetch('villes_africaines.geojson')
  .then(response => response.json())
  .then(data => {

L.geoJSON(data, {

    pointToLayer: function (feature, latlng, layer) {

        var color = feature.properties.color;

            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: color,
                color: 'white',
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0.4
            });
    },

    onEachFeature: function (feature, layer) {

          var popupContent = '<h1>'+feature.properties.name+'</h1><img src="'+feature.properties.img_path+'"style="max-width: 100%; height: auto;">'
          
          layer.bindPopup(popupContent, {
            maxWidth: "auto", 
            minWidth: 300,
        });

      }

    }).addTo(map);

})



const tile = L.tileLayer(mapboxUrl, {
    attribution: attr
}).addTo(map);






