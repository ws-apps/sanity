import PropTypes from 'prop-types'
import React from 'react'
import PreviewSubscriber from './PreviewSubscriber'
import RenderPreviewSnapshot from './RenderPreviewSnapshot'
import SanityDefaultPreview from './SanityDefaultPreview'

export default class SanityPreview extends React.PureComponent {

  static propTypes = {
    layout: PropTypes.string,
    value: PropTypes.any,
    ordering: PropTypes.object,
    type: PropTypes.object.isRequired,
    isPlaceholder: PropTypes.bool
  }

  render() {
    const {type, isPlaceholder, ...rest} = this.props
    if (isPlaceholder) {
      return (
        <SanityDefaultPreview type={type} isPlaceholder media=" " />
      )
    }
    return (
      <PreviewSubscriber type={type} {...rest}>
        {RenderPreviewSnapshot}
      </PreviewSubscriber>
    )
  }
}
