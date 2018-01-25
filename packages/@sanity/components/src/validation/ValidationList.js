import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles/ValidationList.css'
import ValidationListItem from './ValidationListItem'

function toString(path) {
  return path.reduce((target, segment, i) => {
    const segmentType = typeof segment
    if (segmentType === 'number') {
      return `${target}[${segment}]`
    }

    if (segmentType === 'string') {
      const separator = i === 0 ? '' : '.'
      return `${target}${separator}${segment}`
    }

    if (segment._key) {
      return `${target}[_key=="${segment._key}"]`
    }

    throw new Error(`Unsupported path segment "${segment}"`)
  }, '')
}

export default class ValidationList extends React.PureComponent {
  static propTypes = {
    onFocus: PropTypes.func,
    onClose: PropTypes.func,
    showLink: PropTypes.bool,
    markers: PropTypes.arrayOf(
      PropTypes.shape({
        path: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.shape({_key: PropTypes.string})
          ])
        ),
        type: PropTypes.string,
        level: PropTypes.string,
        item: PropTypes.any
      })
    )
  }

  static defaultProps = {
    markers: [],
    onClose: () => undefined,
    showLink: false,
    onFocus: undefined
  }

  componentWillUnmount() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }
  }

  handleClick = (event, path) => {
    const {onFocus, onClose} = this.props
    console.log(path)
    const pathString = path[0]
    // const isNested = path.some(i => typeof i === 'object')
    // console.log('isNested', isNested, pathString)
    const element = document.querySelector(`[data-focus-path="${pathString}"]`)
    console.log('element', element, pathString)

    if (element) {
      element.scrollIntoView({behavior: 'smooth'})
      this.scrollTimeout = setTimeout(() => {
        onFocus(path)
      }, 300)
    } else {
      onFocus(path)
    }
    onClose()
  }

  render() {
    const {markers, showLink} = this.props
    const validation = markers.filter(marker => marker.type === 'validation')
    const errors = validation.filter(marker => marker.level === 'error')
    const warnings = validation.filter(marker => marker.level === 'warning')
    return (
      <div className={styles.root}>
        {errors.length > 0 && (
          <div className={styles.errors}>
            <ul>
              {errors.map((error, i) => (
                <ValidationListItem key={i} marker={error} onClick={this.handleClick} showLink={showLink} />
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className={styles.warnings}>
            <ul>
              {warnings.map((warning, i) => (
                <ValidationListItem key={i} marker={warning} onClick={this.handleClick} showLink={showLink} />
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
}
