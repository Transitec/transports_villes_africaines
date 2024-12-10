const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA'
  
const mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([ 30.0618851, -1.9440727 ], 5);


// L.geoJSON(villes_africaines).addTo(map);

 // Charger le fichier GeoJSON en local
 fetch('villes_africaines_test.geojson') // Remplacez par le chemin de votre fichier GeoJSON
 .then(response => response.json())  // Convertir la réponse en JSON
 .then(data => {
   // Charger les données GeoJSON sur la carte
   L.geoJSON(data, {
    onEachFeature: function (feature, layer) {
      // Vérifier si la feature a une géométrie de type Point
      if (feature.geometry && feature.geometry.type === 'Point') {
        var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]; // [lat, lng]

        // Créer un marker pour chaque feature
        var marker = L.marker(latlng).addTo(map);

        // Créer un contenu personnalisé pour le popup
        var popupContent = "<strong>" + feature.properties.name + "</strong>";

        // Lier le popup au marker
        marker.bindPopup(popupContent, {
          maxWidth: 300,  // Largeur maximale du popup
          closeOnClick: false  // Ne ferme pas le popup lorsque l'on clique ailleurs
        });
      }
    }
  }).addTo(map);
})
 .catch(error => {
   console.error("Erreur lors du chargement du fichier GeoJSON:", error);
 });




const tile = L.tileLayer(mapboxUrl, {
  attribution: attr
}).addTo(map);



