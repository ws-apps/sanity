import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles/ValidationListItem.css'
import WarningIcon from 'part:@sanity/base/warning-icon'
import Button from 'part:@sanity/components/buttons/default'

export default class ValidationListItem extends React.PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
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
    onClick: undefined
  }

  handleClick = () => {
    const {marker, onClick} = this.props
    onClick(marker.path)
  }

  render() {
    const {marker, onClick} = this.props
    return (
      <li className={styles.item}>
        <span className={styles.icon}><WarningIcon /></span>
        <span className={styles.message}>{marker.item.message}</span>
        {
          onClick && (
            <span className={styles.link} onClick={this.handleClick}>
              Go to item
            </span>
          )
        }
      </li>
    )
  }
}
