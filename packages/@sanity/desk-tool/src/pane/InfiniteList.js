import PropTypes from 'prop-types'
import React from 'react'
import VirtualList from 'react-tiny-virtual-list'
import enhanceWithAvailHeight from './enhanceWithAvailHeight'


export default enhanceWithAvailHeight(class InfiniteList extends React.PureComponent {

  static propTypes = {
    height: PropTypes.number,
    items: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    renderItem: PropTypes.func,
    className: PropTypes.string,
    getItemKey: PropTypes.func,
    layout: PropTypes.oneOf(['default', 'detail', 'card', 'media']),
    onScroll: PropTypes.func
  }

  static defaultProps = {
    layout: 'default',
    items: [],
    height: 250
  }

  state = {
    scrollTop: 0,
    triggerUpdate: 0,
    itemHeight: 56,
    itemSize: undefined
  }

  componentWillReceiveProps(prevProps) {

    // if (prevProps.items !== this.props.items) {
    //   /* This is needed to break equality checks
    //    in VirtualList's sCU in cases where itemCount has not changed,
    //    but an elements has been removed or added
    //    */
    //   this.setState({triggerUpdate: Math.random()})
    // }

    if (prevProps.layout !== this.props.layout) {
      this.setState({
        itemSize: undefined
      })
    }
  }

  getItemHeight = item => {
    return 56
  }

  setMeasureElement = element => {
    if (element && element.offsetHeight) {
      this.setState({
        itemSize: element.offsetHeight
      })
    }
  }
  handleScroll = scrollTop => {
    this.setState({
      scrollTop: scrollTop
    })
    this.props.onScroll(scrollTop)
  }

  renderItem = ({index, style}) => {
    const {renderItem, items} = this.props
    const item = items[index]

    return (
      <div key={index} style={style}>
        {
          style.top >= this.state.scrollTop && style.top < this.state.scrollTop + (this.props.height * 2)
            ? renderItem(item, index, {isPlaceholder: false})
            : renderItem(item, index, {isPlaceholder: true})
        }
      </div>
    )
  }

  render() {
    const {height, items, className, renderItem} = this.props
    const {itemSize} = this.state

    if (!items || items.length === 0) {
      return (
        <div />
      )
    }

    if (!itemSize && items) {
      return (
        <div ref={this.setMeasureElement}>
          {renderItem(items[0], 0)}
        </div>
      )
    }

    return (
      <VirtualList
        onScroll={this.handleScroll}
        className={className || ''}
        height={height}
        itemCount={items.length}
        itemSize={itemSize}
        renderItem={this.renderItem}
      />
    )
  }
})
