# @sanity/export

Exports documents and assets from a Sanity dataset

## Installing

```
npm install --save @sanity/export
```

## Usage

```js
const exportDataset = require('@sanity/export')

exportDataset({
  // Instance of @sanity/client configured to correct project ID and dataset
  client: someInstantiatedSanityClientInstance,

  // Name of dataset to export
  dataset: 'myDataset',

  // Path to write zip-file to, or `-` for stdout
  outputPath: '/home/your-user/myDataset.zip',

  // Whether or not to export assets. Note that this operation is currently slightly lossy;
  // metadata stored on the asset document itself (original filename, for instance) might be lost
  // Default: `true`
  assets: false,

  // Exports documents only, without downloading or rewriting asset references. Note that the
  // `assets` option is still respected, determining whether or not to include asset documents
  raw: true
})
```

## Future improvements

* Restore original filenames, keep track of duplicates, increase counter (`filename (<num>).ext`)
* Skip archiving on raw/no-asset mode?

## CLI-tool

This functionality is built in to the `@sanity/cli` package as `sanity dataset export`

## License

MIT-licensed. See LICENSE.