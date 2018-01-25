import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles/ValidationListItem.css'
import WarningIcon from 'part:@sanity/base/warning-icon'

export default class ValidationListItem extends React.PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
    showLink: PropTypes.bool,
    marker: PropTypes.shape({
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
    }).isRequired
  }

  static defaultProps = {
    onClick: undefined,
    showLink: false
  }

  handleClick = event => {
    const {marker, onClick} = this.props
    if (onClick) {
      onClick(event, marker.path)
    }
  }

  render() {
    const {marker, onClick, showLink} = this.props
    return (
      <li className={styles.item}>
        <span className={styles.icon}><WarningIcon /></span>
        <span className={styles.message}>{marker.item.message}</span>
        {
          onClick && showLink && (
            <span className={styles.link} onClick={this.handleClick}>
              Go to item
            </span>
          )
        }
      </li>
    )
  }
}
