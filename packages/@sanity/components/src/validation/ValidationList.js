import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles/ValidationList.css'
import WarningIcon from 'part:@sanity/base/warning-icon'

export default class ValidationList extends React.PureComponent {
  static propTypes = {
    markers: PropTypes.arrayOf(
      PropTypes.shape({
        path: PropTypes.arrayOf(PropTypes.string),
        type: PropTypes.string,
        level: PropTypes.string,
        item: PropTypes.any
      })
    )
  }

  static defaultProps = {
    markers: []
  }

  render() {
    const {markers} = this.props
    const validation = markers.filter(marker => marker.type === 'validation') || []
    const errors = validation.filter(marker => marker.level === 'error') || []
    const warnings = validation.filter(marker => marker.level === 'warning') || []
    return (
      <div className={styles.root}>
        {
          errors && errors.length > 0 && (
            <div className={styles.errors}>
              <h3>Errors</h3>
              <ul>
                {
                  errors.map((error, i) => {
                    return (
                      <li key={i}>{error.item.message}</li>
                    )
                  })
                }
              </ul>
            </div>
          )
        }
        {
          warnings && warnings.length > 0 && (
            <div className={styles.warnings}>
              <h3>Warnings</h3>
              <ul>
                {
                  warnings.map((warning, i) => {
                    return (
                      <li key={i}>{warning.item.message}</li>
                    )
                  })
                }
              </ul>
            </div>
          )
        }
      </div>
    )
  }
}
