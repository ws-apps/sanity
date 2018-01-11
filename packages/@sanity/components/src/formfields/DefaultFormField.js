import PropTypes from 'prop-types'
import React from 'react'

import styles from 'part:@sanity/components/formfields/default-style'
import DefaultLabel from 'part:@sanity/components/labels/default'

export default class DefaultFormField extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    className: PropTypes.string,
    inline: PropTypes.bool,
    description: PropTypes.string,
    level: PropTypes.number,
    children: PropTypes.node,
    wrapped: PropTypes.bool,
    labelFor: PropTypes.string,
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
    level: 1,
    markers: []
  }

  // @todo generalize/refactor validation rendering into separate components or similar
  getValidationClass(validation) {
    if (validation.some(marker => marker.level === 'error')) {
      return styles.validationError
    }

    if (validation.some(marker => marker.level === 'warning')) {
      return styles.validationWarning
    }

    return ''
  }

  // @todo generalize/refactor validation rendering into separate components or similar
  renderValidationResult(validation) {
    const errors = validation.filter(marker => marker.level === 'error')
    const warnings = validation.filter(marker => marker.level === 'warning')
    if (errors.length === 0 && errors.warnings === 0) {
      return null
    }

    const messages = errors.length > 0 ? errors : warnings
    return <ul>{messages.map((err, i) => <li key={i}>{err.item.message}</li>)}</ul>
  }

  render() {
    const {
      level,
      label,
      labelFor,
      description,
      children,
      inline,
      wrapped,
      className,
      markers
    } = this.props

    const validation = markers.filter(marker => marker.type === 'validation')
    const validationClass = this.getValidationClass(validation)
    const levelClass = `level_${level}`

    return (
      <div
        className={`
          ${inline ? styles.inline : styles.block}
          ${validationClass}
          ${styles[levelClass] || ''}
          ${wrapped ? styles.wrapped : ''}
          ${className || ''}`}
      >
        <label className={styles.inner} htmlFor={labelFor}>
          {label && (
            <DefaultLabel className={styles.label} level={level}>
              {label}
            </DefaultLabel>
          )}

          {description && <div className={styles.description}>{description}</div>}

          <div className={styles.content}>{children}</div>

          {this.renderValidationResult(validation)}
        </label>
      </div>
    )
  }
}
