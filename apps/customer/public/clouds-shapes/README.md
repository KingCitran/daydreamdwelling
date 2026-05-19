# Cloud Shapes (Easter-egg sprites)

Drop your cloud-shaped PNG files here. These are rare-spawn special clouds
(e.g. a castle, teddy bear, sailboat) that appear ~1-2% of the time in the
cloud field, mood-aware where it makes sense.

After dropping files in this folder, edit
`apps/customer/src/scene/cloudShapes.js` to add an entry for each:

```js
{ id: 'castle',  filename: 'castle.png',  label: 'Castle',  moods: ['Dream State', 'Moonlight'] }
```

The `moods` array decides which moods this shape can appear in. Use
`['*']` (or omit) for shapes that appear in any mood.

Shape clouds preview in the cloud picker (`/clouds-picker.html`) so you
can browse them per mood and verify they look right.
