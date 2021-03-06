import lazyRequire from '@sanity/util/lib/lazyRequire'

const helpText = `
Options
  --source-maps Enable source maps for built bundles (increases size of bundle)
  --no-minify Skip minifying built Javascript (speeds up build, increases size of bundle)

Examples
  sanity build
  sanity build --no-minify --source-maps
`

export default {
  name: 'build',
  signature: '[OUTPUT_DIR]',
  description: 'Builds the current Sanity configuration to a static bundle',
  action: lazyRequire(require.resolve('../../actions/build/buildStaticAssets')),
  helpText
}
