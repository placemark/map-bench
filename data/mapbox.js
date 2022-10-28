mapboxgl.accessToken =
  "pk.eyJ1IjoidG1jdyIsImEiOiJja2YzMmc3YnkxbWhzMzJudXk2c2x3MTVhIn0.XZpElz19TDemsBc0yvkRPw";

const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: {
    version: 8,
    name: "empty",
    layers: [],
    sources: {},
  },
  center: [-75, 38.5],
  zoom: 7,
});

const features = [];
for (let i = 0; i < 1e4; i++) {
  features.push({
    // feature for Mapbox DC
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [(i / 1e4 - 0.5) * 80, (i / 1e4 - 0.5) * 80],
    },
    properties: {},
  });
}

map.on("load", () => {
  fetch("https://tmcw-tmp-cors.s3.amazonaws.com/Delaware.geojson")
    .then((data) => data.json())
    .then((geojson) => {
      map.addSource("points", {
        type: "geojson",
        data: geojson,
        tolerance: 0,
      });

      map.addLayer({
        id: "points",
        type: "fill",
        source: "points",
        layout: {},
      });
    });
});
