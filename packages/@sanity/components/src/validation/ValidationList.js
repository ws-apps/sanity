import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles/ValidationList.css'
import ValidationListItem from './ValidationListItem'

export default class ValidationList extends React.PureComponent {
  static propTypes = {
    onFocus: PropTypes.func,
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
    showLink: false,
    onFocus: undefined
  }

  render() {
    const {markers, onFocus, showLink} = this.props
    const validation = markers.filter(marker => marker.type === 'validation')
    const errors = validation.filter(marker => marker.level === 'error')
    const warnings = validation.filter(marker => marker.level === 'warning')
    return (
      <div className={styles.root}>
        {errors.length > 0 && (
          <div className={styles.errors}>
            <ul>
              {errors.map((error, i) => (
                <ValidationListItem key={i} marker={error} onClick={onFocus} showLink={showLink} />
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className={styles.warnings}>
            <ul>
              {warnings.map((warning, i) => (
                <ValidationListItem key={i} marker={warning} onClick={onFocus} showLink={showLink} />
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
}
