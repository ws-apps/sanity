import React from 'react'
import PropTypes from 'prop-types'

export default class ValidationListItem extends React.PureComponent {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
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

  handleClick = () => {
    const {marker, onClick} = this.props
    onClick(marker.path)
  }

  render() {
    const {marker} = this.props
    return <li onClick={this.handleClick}>{marker.item.message}</li>
  }
}
