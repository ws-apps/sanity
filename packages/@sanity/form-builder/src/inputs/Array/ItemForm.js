// @flow
import React from 'react'
import {FormBuilderInput} from '../../FormBuilderInput'
import PatchEvent from '../../PatchEvent'
type Props = {
  value: Object,
  type: any,
  level: number,
  onChange: (event: PatchEvent, value: Object) => void
}

export default class ItemForm extends React.Component<Props> {
  props: Props

  handleChange = (event : PatchEvent) => {
    const {value, onChange} = this.props
    onChange(event, value)
  }

  render() {
    const {value, type, level} = this.props
    return (
      <FormBuilderInput
        value={value}
        type={type}
        level={level}
        onChange={this.handleChange}
        autoFocus
      />
    )
  }
}
