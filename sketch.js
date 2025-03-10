const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA'
  
const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([ 1.38, 22.7 ], 4);


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
                opacity: 0.7,
                fillOpacity: 0.7
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

// Crée une classe de contrôle personnalisé
const ImageControl = L.Control.extend({
  onAdd: function () {
      // Crée un div pour contenir l'image
      const div = L.DomUtil.create('div', 'custom-image');
      div.innerHTML = '<img src="./A9-8-fig-ade-legende-fr.png" alt="Logo">';
      return div;
  },
});

// Ajoute le contrôle à la carte (en bas à gauche)
const imageControl = new ImageControl({ position: 'bottomright' });
map.addControl(imageControl);


const tile = L.tileLayer(mapboxUrl, {
    attribution: attr
}).addTo(map);






