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

map.on("load", () => {
  map.addSource("points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features,
    },
  });

  map.addLayer({
    id: "points",
    type: "circle",
    source: "points",
    layout: {},
  });

  function doQuery() {
    const features = map.queryRenderedFeatures(
      [Math.random() * 800, Math.random() * 800],
      {
        layers: ["points"],
      }
    );
  }

  setInterval(() => {
    const start = performance.now();
    let ticks = 1e3;
    for (let i = 0; i < ticks; i++) {
      doQuery();
    }
    const elapsed = performance.now() - start;
    const perSecond = ticks / elapsed;

    counter.innerHTML = `${perSecond.toFixed(2)} query/ms`;
  }, 1000);
});
