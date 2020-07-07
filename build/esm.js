import build from './build'

export default Object.assign(build, {
  input: 'src/tingle.js',
  output: Object.assign(build.output, {
    file: 'dist/tingle.esm.js',
    format: 'es'
  })
})
