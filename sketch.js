const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA'
  
const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([ 30.0618851, -1.9440727 ], 5);




fetch('villes_africaines_test.geojson')
  .then(response => response.json())
  .then(data => {

    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {

        var popupContent = '<h1>'+feature.properties.name+'</h1><img src="./img/'+feature.properties.name+'.png" style="max-width: 100%; height: auto;">'
        
        var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        layer.bindPopup(popupContent, {
          maxWidth: "auto", 
          minWidth: 300,
        });

      }
    }).addTo(map);
  })


/* fetch('villes_africaines_test.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {

      if (feature.geometry && feature.geometry.type === 'Point') {
          var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]; // [lat, lng]

          var marker = layer.marker(latlng).addTo(map);

          var popupContent = "<strong>" + feature.properties.name + "</strong><br>" 

          marker.bindPopup(popupContent);
        }
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error("Erreur lors du chargement du fichier GeoJSON:", error);
  }); */



const tile = L.tileLayer(mapboxUrl, {
  attribution: attr
}).addTo(map);






