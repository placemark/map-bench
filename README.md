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
