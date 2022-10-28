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
  center: [0, 0],
  zoom: 2,
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

map.once("load", () => {
  const overlay = new deck.MapboxOverlay({
    layers: [
      new deck.GeoJsonLayer({
        data: features,
        id: "points",
        pickable: true,
        pointRadiusUnits: "pixels",
        getPointRadius: 5,
      }),
    ],
  });
  map.addControl(overlay);

  function doQuery() {
    const objects = overlay.pickObjects({
      x: Math.random() * 800,
      y: Math.random() * 800,
      layerIds: ["points"],
    });
  }

  setInterval(() => {
    const start = Date.now();
    let ticks = 1e3;
    for (let i = 0; i < ticks; i++) {
      doQuery();
    }
    const elapsed = Date.now() - start;
    const perSecond = ticks / elapsed;

    counter.innerHTML = `${perSecond.toFixed(2)} query/ms`;
  }, 1000);
});
