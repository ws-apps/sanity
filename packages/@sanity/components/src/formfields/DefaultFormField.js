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
    validation: PropTypes.shape({
      warnings: PropTypes.arrayOf(PropTypes.instanceOf(Error)),
      errors: PropTypes.arrayOf(PropTypes.instanceOf(Error))
    })
  }

  static defaultProps = {
    level: 1
  }

  getValidationClass() {
    const validation = this.props.validation
    if (validation && validation.errors.length > 0) {
      return styles.validationError
    }

    if (validation && validation.warnings.length > 0) {
      return styles.validationWarning
    }

    return ''
  }

  renderValidationResult(validation) {
    const hasErrors = validation && validation.errors.length > 0
    const hasWarnings = validation && validation.warnings.length > 0
    if (!hasErrors && !hasWarnings) {
      return null
    }

    const messages = hasErrors ? validation.errors : validation.warnings
    return <ul>{messages.map((err, i) => <li key={i}>{err.message}</li>)}</ul>
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
      validation
    } = this.props

    const validationClass = this.getValidationClass()
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
