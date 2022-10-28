# map-bench

Some light analysis and research for map frameworks.

## Mapbox vs Deck.gl: "picking"

See the `picking/` directory. The main takeaway there is that
querying for displayed features - in Mapbox, `queryRenderedFeatures`,
in Deck, `pickObjects`, is a big performance difference. In the
testcase, which attempts to be as equal as possible, I see something
like:

- Mapbox `queryRenderedFeatures`: 33 queries/ms
- Deck `pickObjects`: 1.5 queries/ms

In the given scenario, Mapbox is 10-30x faster than Deck. The two
modules take very different approaches to the problem.

Mapbox creates a [FeatureIndex](https://github.com/mapbox/mapbox-gl-js/blob/cd11bcb3838d2011dc686f6888e87671c108cc1d/src/data/feature_index.js),
which uses an index - [grid-index](https://github.com/mapbox/grid-index)
for where those features are.

Deck uses [picking](https://deck.gl/docs/developer-guide/custom-layers/picking) - encoding
feature indexes into colors and then writing those to a WebGL buffer.

The bottleneck in Deck's implementation is that for every call to `pickObject`
or `pickObjects`, it needs to read rendered data from the canvas. This is
a slow operation: it takes up 90% of a bottom-up profile of the example
benchmark.

---

From the user's perspective, it appears that pickObjects and queryRenderedFeatures
have roughly equivalent power, but pickObjects is much slower. I'm not sure currently
whether there are advantages to the color-encoded picking strategy: it seems like
it could be easier for the Deck team to implement new layer types with picking,
especially taking 3D occlusion into account.

One oddity for the picking approach in Deck is that it seems to always require
a read per pick. In the common case where someone's cursor is moving over
a stationary, non-animated map, it certainly seems like they could re-use
an already-retrieved picking buffer.

## Mapbox vs Deck.gl: data

Mapbox, by default, simplifies and excludes data when it processes
a geojson source in GL JS. The effect of this is extreme with large
datasets composed of geographically tiny features. It renders quickly,
but almost nothing is visible. So the way to get a fair comparison, and
something useful, is to set tolerance to zero:

```js
map.addSource("points", {
  type: "geojson",
  data: geojson,
  tolerance: 0,
});
```

The experience of using Mapbox versus Deck with larger datasets is:

Deck gets to the initial render much faster and its zoomed out views
are darker than Mapbox's, like the gamma is higher on its antialiasing.
After the initial render, there's a great deal of lag when you pan
around a Deck-rendered map, and almost none navigating the Mapbox one.
This is confirmed by Chrome devtools - Deck lags to 20fps dragging,
Mapbox stays at 60fps.


Zooming into the map in Mapbox will show simplified or quantized features that
are then replaced with full-quality features. This doesn't happen
with Deck - there's no simplification, so you never see
simplified features.

_Note for the reader: this is a surprising result. Mapbox is doing
better with bigger data than I remembered. It's time to look closer._

And as I write that note, the Mapbox tab crashes. So there are other
issues with Mapbox that don't occur with Deck. In particular: Mapbox
uses WebWorkers to get tiles, simplify them, etc. Those workers
are shared between your custom GeoJSON layer and the map's own
layers. When you load a big GeoJSON layer, it causes the map's
own layers to load more slowly. There's one effect in particular,
in which a basemap tile will fail to load if you've just
been looking at a part of the map with lots of data and you zoom
out ([screenshot](https://share.cleanshot.com/YfKb2D)). This is
oddly persistent - it'll take seconds, sometimes, to see the tile
load.
