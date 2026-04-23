const accessToken = 'sk.eyJ1IjoiYWRlLXRyYW5zaXRlYyIsImEiOiJjbTRiZzFxYWUwNDJ1MmtyNDNia29qYWN3In0.1dSIQ5MuxXILFGhf5aqYkA';

let language = 'fr'; // Langue par défaut
let villesLayer;
let capitalesLayer;

const mapboxUrls = {
    'fr': 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?language=fr&access_token=' + accessToken,
    'en': 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?language=en&access_token=' + accessToken
};

const attr = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>contributors';

const map = L.map('mapid').setView([1.38, 22.7], 4);

function cityStyleByPopRank(popRank) {
    
    if (!popRank) {
        return { radius: 8, weight: 1.5, fillOpacity: 0.85 };
    }

    switch(true) {
        case popRank == 1:
            return { radius: 13, weight: 2, fillOpacity: 0.9 };
        case popRank == 2:
            return { radius: 11, weight: 2, fillOpacity: 0.9 };
        case popRank == 3:
            return { radius: 10, weight: 2, fillOpacity: 0.9 };
        case popRank == 4:
            return { radius: 8, weight: 1.5, fillOpacity: 0.85 }
        case popRank == 5:
            return { radius: 6.5, weight: 1.5, fillOpacity: 0.85 };
        case popRank == 6:
            return { radius: 5.5, weight: 1, fillOpacity: 0.8 };
        case popRank == 7:
            return { radius: 4.5, weight: 1, fillOpacity: 0.8 };   
    }
}

function maxCityLabelsByZoom(zoom) {
    if (zoom < 3) return 10;
    return 50;
}

function updateLabelsByZoom() {
    
    const zoom = map.getZoom();

    if (capitalesLayer) {

        const layers = [];

        capitalesLayer.eachLayer(layer => {
        //layer.closeTooltip(); // on ferme tout d’abord
        layers.push(layer);
        });

        layers.sort((a, b) => a.popRank - b.popRank);

        const maxLabels = maxCityLabelsByZoom(zoom);

        layers.slice(0, maxLabels).forEach(layer => {
        layer.openTooltip();
        });
    }
}

let tileLayer = L.tileLayer(mapboxUrls[language], { attribution: attr }).addTo(map);

const legendImages = {
    'fr': './d0-3_2301-fig-ade-legende_fr.png',
    'en': './d0-3_2301-fig-ade-legende_en.png'
};

const legendButtonLabel = {
    'fr': 'Légende',
    'en': 'Legend'
};

const legendControl = L.control({ position: 'bottomright' });
legendControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'custom-image');
    div.innerHTML = `<img id="legend-img" src="${legendImages[language]}" alt="${legendButtonLabel[language]}">`;
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

loadVilles();
loadCapitales();

function loadCapitales() {
    fetch('capitales_africaines_en_fr.geojson')
        .then(response => response.json())
        .then(data => {
            capitalesLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                const popRank = feature.properties.POP_RANK;
                const style = cityStyleByPopRank(popRank);
                const tcp = feature.properties.TCP;

                return L.circleMarker(latlng, {
                    radius: style.radius,
                    color: "grey",                
                    fillOpacity: 0,
                    weight: style.weight,
                    opacity: 0.8,
                });
            },

            onEachFeature: function (feature, layer) {
            const name =
                language === 'fr'
                ? feature.properties.NAME_FR
                : feature.properties.NAME_EN;
    
            layer.bindTooltip(name, {
                permanent: false,
                direction: "center",
                offset: [0, -15],
                className: "city-label"
            });

            layer.popRank = feature.properties.POP_RANK;
            }
            }).addTo(map);
            updateLabelsByZoom();
        })
        .catch(error => console.error("Erreur couche capitales :", error));
    }
    
function loadVilles() {
    fetch('villes_africaines.geojson')
        .then(response => response.json())
        .then(data => {
            
            villesLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    const popRank = feature.properties.POP_RANK;
                    const style = cityStyleByPopRank(popRank);

                    return L.circleMarker(latlng, {
                        radius: style.radius,
                        fillColor: feature.properties.color,
                        color: 'white',
                        weight: 1,
                        opacity: 0.7,
                        fillOpacity: 0.8
                    });
                },
                onEachFeature: function (feature, layer) {
                    let imgPath = `img/${language}/${feature.properties.img_path}`;
                    let popupContent = `<img src="${imgPath}" style="max-width: 100%; height: auto;">`;
                    layer.bindPopup(popupContent, {
                        maxWidth: "auto",
                        minWidth: 300,
                    });
                }
            }).addTo(map);

            updateLabelsByZoom();
        })
        .catch(error => console.error("Erreur de chargement du GeoJSON :", error));
    }

const switchLanguage = () => {

    if (villesLayer) map.removeLayer(villesLayer);
    if (capitalesLayer) map.removeLayer(capitalesLayer);

    language = language === 'fr' ? 'en' : 'fr';
    tileLayer.setUrl(mapboxUrls[language]);

    loadVilles();
    loadCapitales();

    document.getElementById('legend-img').src = legendImages[language];
    updateLegendButton();
};

const updateLegendButton = () => {
    const legendButton = document.querySelector('.leaflet-control-custom');
    if (legendButton) {
        legendButton.innerHTML = legendButtonLabel[language];
    }
};

const legendButton = L.control({ position: 'topright' });
legendButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = legendButtonLabel[language];
    button.onclick = toggleLegend;
    
    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);

    return button;
};
legendButton.addTo(map);

const languageButton = L.control({ position: 'topright' });
languageButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = 'FR/EN';
    button.onclick = switchLanguage;
    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);
    return button;
};
languageButton.addTo(map);

map.on('zoomend', updateLabelsByZoom);
map.on('popupopen popupclose', updateLabelsByZoom);