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

map.once("load", () => {
  fetch("https://tmcw-tmp-cors.s3.amazonaws.com/Delaware.geojson")
    .then((data) => data.json())
    .then((geojson) => {
      const overlay = new deck.MapboxOverlay({
        layers: [
          new deck.GeoJsonLayer({
            data: geojson.features,
            id: "points",
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            getLineWidth: 2,
            getLineColor: [0, 0, 0, 255],
          }),
        ],
      });
      map.addControl(overlay);
    });
});
