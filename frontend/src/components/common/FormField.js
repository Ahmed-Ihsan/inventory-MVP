import React, { forwardRef } from 'react';

/**
 * Professional FormField component with validation, error states, and consistent styling
 */
const FormField = forwardRef(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  help,
  required = false,
  disabled = false,
  placeholder,
  options = [],
  rows = 3,
  className = '',
  icon,
  children,
  ...props
}, ref) => {
  const fieldId = `field-${name}`;
  const hasError = !!error;
  const hasSuccess = !!success;
  const fieldClass = hasError ? 'input-error' : '';

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange,
      onBlur,
      disabled,
      placeholder,
      className: `input ${fieldClass}`,
      'aria-describedby': help ? `${fieldId}-help` : undefined,
      'aria-invalid': hasError,
      ref,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={`input ${fieldClass}`}
          />
        );

      case 'select':
        return (
          <select {...commonProps} className={`input ${fieldClass}`}>
            {children || options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="checkbox-wrapper">
            <input
              {...commonProps}
              type="checkbox"
              checked={value}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            <label htmlFor={fieldId} style={{ margin: 0, fontWeight: 'normal' }}>
              {label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option) => (
              <div key={option.value} className="radio-item">
                <input
                  {...commonProps}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  style={{ width: 'auto', marginRight: '8px' }}
                />
                <label style={{ margin: 0, fontWeight: 'normal' }}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return renderInput();
  }

  return (
    <div className={`form-group ${required ? 'required' : ''} ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={fieldId} className="form-label">
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {renderInput()}

      {help && (
        <div id={`${fieldId}-help`} className="form-help">
          {help}
        </div>
      )}

      {hasError && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {hasSuccess && !hasError && (
        <div className="form-success" style={{ color: 'var(--color-success)', fontSize: '0.8125rem', marginTop: '4px' }}>
          {success}
        </div>
      )}
    </div>
  );
});

export default FormField;