import '../styles/index.scss';
import * as L from 'leaflet';
import * as LA from 'leaflet-ajax'

const map = L.map('map').setView([34, -111], 6);

const tonerUrl = "http://{S}tile.stamen.com/toner-lite/{Z}/{X}/{Y}.png";

const url = tonerUrl.replace(/({[A-Z]})/g, s => s.toLowerCase());

const basemap = L.tileLayer(url, {
  subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
  minZoom: 0,
  maxZoom: 20,
  type: 'png',
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
});

basemap.addTo(map);

// Load external geoJson sequentially
async function externalGeoJson() {
  let d3Processed = null;
  let i = 1;
  for (i; i < 43; i++) {
    let itemString = String(i);

    //add leading zero for 1-9
    if(itemString.length === 1) {
      itemString = itemString.padStart(2, '0')
    }

    let path = `/data/pass_${itemString}.geojson`;

    let response = await fetch(path)
    let json = await response.json()
    let geoJson = await parseGeoJson(json)
    d3Processed = await d3Processing(geoJson)
  }
    return d3Processed;
}



externalGeoJson()
  .catch(console.error);

// Parse file to be LineString
function parseGeoJson(jsonArray) {
  let object = {};

  let featuresObject = {
    'type': 'FeatureCollection',
    'features': [{
      'type': 'Feature',
      'properties': {name: 'test'},
      'geometry': { 'type': 'LineString', 'coordinates': [] }
    }]
  };
  let coordArray = [];

  // Create LineString in geojson to create lines
  jsonArray.features.forEach((item, index) => {
    if (index === 0) {
      featuresObject.features.push(item)
    }
    item.geometry.coordinates.forEach((coordinate) => {
      coordArray.push(coordinate)
    });

    // Remove elevation from array, add to array of arrays in object
    coordArray.splice(2,1)
    featuresObject.features[0].geometry.coordinates.push(coordArray)
    coordArray = []

  });

  return featuresObject;
}

// Add geoJson to map
function d3Processing(formattedGeojson){

  // Custom marker
  const fontAwesomeIcon = L.divIcon({
    html: '<i class="fas fa-hiking"></i>',
    iconSize: [25, 25],
    className: 'myDivIcon'
  });

  L.geoJson(formattedGeojson, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
          icon: fontAwesomeIcon});
        },
    style() {
      return {
        color: '#2b8cbe',
        opacity: 0.7,
        weight: 3,
      };
    }
  }).addTo(map);
}
