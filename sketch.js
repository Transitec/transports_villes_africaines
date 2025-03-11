const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

let language = 'fr'; // Langue par défaut

const mapboxUrls = {
    'fr': 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?language=fr&access_token=' + accessToken,
    'en': 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?language=en&access_token=' + accessToken
};

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([1.38, 22.7], 4);
let tileLayer = L.tileLayer(mapboxUrls[language], { attribution: attr }).addTo(map);

const legendImages = {
    'fr': './d0-3_2301-fig-ade-legende-fr.png',
    'en': './d0-3_2301-fig-ade-legende-en.png'
};

const legendControl = L.control({ position: 'bottomright' });
legendControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'custom-image');
    div.innerHTML = `<img id="legend-img" src="${legendImages[language]}" alt="Légende">`;
    return div;
};
legendControl.addTo(map);

const toggleLegend = () => {
    const legendImg = document.getElementById('legend-img');
    if (legendImg.style.display === 'none') {
        legendImg.style.display = 'block';
    } else {
        legendImg.style.display = 'none';
    }
};

// on doit mettre ici aussi le chargement du geojson, sinon il n'est chargé que dans la fonction switchLanguage et rien n'apparait au 1er load tant que le user n'a pas cliqué sur le bouton de langue
fetch('villes_africaines.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: feature.properties.color,
                    color: 'white',
                    weight: 1,
                    opacity: 0.7,
                    fillOpacity: 0.7
                });
            },
            onEachFeature: function (feature, layer) {
                let imgPath = `img/${language}/${feature.properties.img_path}`;
                let popupContent = `<h1>${feature.properties.name}</h1><img src="${imgPath}" style="max-width: 100%; height: auto;">`;
                layer.bindPopup(popupContent, {
                    maxWidth: "auto",
                    minWidth: 300,
                });
            }
        }).addTo(map);
    })
    .catch(error => console.error("Erreur de chargement du GeoJSON :", error));


const switchLanguage = () => {
  language = language === 'fr' ? 'en' : 'fr';
  tileLayer.setUrl(mapboxUrls[language]);
  document.getElementById('legend-img').src = legendImages[language];


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
                  let imgPath = `img/${language}/${feature.properties.img_path}`;
                  var popupContent = '<h1>'+feature.properties.name+'</h1><img src="'+imgPath+'"style="max-width: 100%; height: auto;">'
                  
                  layer.bindPopup(popupContent, {
                    maxWidth: "auto", 
                    minWidth: 300,
                });

              }

            }).addTo(map);
  })
};


const legendButton = L.control({ position: 'topright' });
legendButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = 'Légende';
    button.onclick = toggleLegend;
    return button;
};
legendButton.addTo(map);

const languageButton = L.control({ position: 'topright' });
languageButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = 'FR/EN';
    button.onclick = switchLanguage;
    return button;
};
languageButton.addTo(map);
