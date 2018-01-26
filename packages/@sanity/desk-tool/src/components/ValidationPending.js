import PropTypes from 'prop-types'
/* eslint-disable react/no-multi-comp */
import React from 'react'
import Dialog from 'part:@sanity/components/dialogs/fullscreen'
import Spinner from 'part:@sanity/components/loading/spinner'

const ACTIONS = [{name: 'cancel', title: 'Close', color: 'success', autoFocus: true}]

export default class ConfirmPublish extends React.PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    results: PropTypes.array
  }

  render() {
    const {results, onClose} = this.props

    return (
      <Dialog
        isOpen
        showHeader
        title={results ? 'Validation errors' : 'Validating document'}
        centered
        onClose={onClose}
        onAction={this.props.onClose}
        actions={ACTIONS}
      >
        {results ? (
          <div>Document has errors that need to be resolved before publishing</div>
        ) : (
          <Spinner message="Validating document…" />
        )}
      </Dialog>
    )
  }
}
