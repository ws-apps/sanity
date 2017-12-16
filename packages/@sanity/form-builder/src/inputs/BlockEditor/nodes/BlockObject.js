// @flow
import type {BlockContentFeatures, SlateValue, Type, SlateChange} from '../typeDefs'
import type {Node} from 'react'

import React from 'react'
import {Block} from 'slate'
import {get} from 'lodash'

import PatchEvent from '../../../PatchEvent'
import {applyAll} from '../../../simplePatch'
import {resolveTypeName} from '../../../utils/resolveTypeName'

import {removeSpan} from '../utils/changes'

import {FormBuilderInput} from '../../../FormBuilderInput'
import DefaultButton from 'part:@sanity/components/buttons/default'
import EditItemFold from 'part:@sanity/components/edititem/fold'
import EditItemPopOver from 'part:@sanity/components/edititem/popover'
import FocusManager from '../../../sanity/focusManagers/SimpleFocusManager'
import FullscreenDialog from 'part:@sanity/components/dialogs/fullscreen'
import InvalidValue from '../../InvalidValue'
import Preview from '../../../Preview'

import styles from './styles/BlockObject.css'

type Props = {
  attributes: {},
  blockContentFeatures: BlockContentFeatures,
  children: Node,
  editorValue: SlateValue,
  node: Block,
  onChange: (change: SlateChange) => void,
  onFormBuilderInputBlur: (nextPath: []) => void,
  onFormBuilderInputFocus: (nextPath: []) => void,
  type: ?Type
}

type State = {
  isDragging: boolean,
  isEditing: boolean,
  isSelected: boolean,
}

export default class BlockObject extends React.Component<Props, State> {

  rootElement: ?HTMLDivElement = null

  state = {
    isSelected: false,
    isEditing: false,
    isDragging: false
  }

  getValue() {
    return this.props.node.data.get('value')
  }

  handleChange = event => {
    const {node} = this.props
    console.log(event.prefixAll(node.key))
  }

  handleToggleEdit = () => {
    this.setState({isEditing: true})
  }

  handleClose = () => {
    this.setState({isEditing: false})
  }

  refFormBuilderBlock = formBuilderBlock => {
    this.formBuilderBlock = formBuilderBlock
  }

  refPreview = previewContainer => {
    this.previewContainer = previewContainer
  }

  renderInput() {
    const {editorValue, type} = this.props
    console.log(type)
    const value = this.getValue()

    const fieldsQty = ((type && type.fields) || []).length

    let editModalLayout = get(this, 'props.type.options.editModal')

    // Choose editModal based on number of fields
    if (!editModalLayout) {
      if (fieldsQty < 3) {
        editModalLayout = 'popover'
      } else {
        editModalLayout = 'fullscreen'
      }
    }

    const input = (
      <FocusManager>{this.renderFormBuilderInput}</FocusManager>
    )

    if (editModalLayout === 'fullscreen') {
      return (
        <FullscreenDialog
          isOpen
          title={this.props.node.title}
          onClose={this.handleClose}
        >
          {input}
        </FullscreenDialog>
      )
    }

    if (editModalLayout === 'fold') {
      return (
        <div className={styles.editBlockContainerFold}>
          <EditItemFold
            isOpen
            title={this.props.node.title}
            onClose={this.handleClose}
          >
            {input}
          </EditItemFold>
        </div>
      )
    }

    // default
    return (
      <div className={styles.editBlockContainerPopOver}>
        <EditItemPopOver
          isOpen
          title={this.props.node.title}
          onClose={this.handleClose}
        >
          {input}
        </EditItemPopOver>
      </div>
    )
  }

  renderFormBuilderInput = ({onFocus, onBlur, focusPath}) => {
    const {type} = this.props
    const value = this.getValue()

    return (
      <FormBuilderInput
        type={type}
        level={0}
        value={value}
        onChange={this.handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        focusPath={focusPath}
        path={[{_key: value._key}]}
      />
    )
  }

  renderPreview() {
    const {type} = this.props
    const value = this.getValue()
    if (!type) {
      return (
        <InvalidValue
          validTypes={[type]}
          actualType={type}
          value={value}
          onChange={this.handleInvalidValueChange}
        />
      )
    }
    return (
      <Preview
        type={type}
        value={this.getValue()}
        layout="block"
      />
    )
  }

  render() {
    const {isEditing} = this.state
    const {attributes, node, editorValue} = this.props
    const isFocused = editorValue.selection.hasFocusIn(node)

    let className
    if (isFocused && !this.state.isSelected) {
      className = styles.focused
    } else if (this.state.isSelected) {
      className = styles.selected
    } else {
      className = styles.root
    }

    return (
      <div
        {...attributes}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onDragEnter={this.handleCancelEvent}
        onDragLeave={this.handleCancelEvent}
        onDrop={this.handleCancelEvent}
        draggable
        onClick={this.handleToggleEdit}
        ref={this.refFormBuilderBlock}
        className={className}
      >
        <span
          ref={this.refPreview}
          className={styles.previewContainer}
        >
          {this.renderPreview()}
        </span>

        {isEditing && this.renderInput()}
      </div>
    )
  }

}
