import React, { forwardRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

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
  prefix,
  suffix,
  clearable = false,
  maxLength,
  showCount = false,
  children,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = `field-${name}`;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const charCount = typeof value === 'string' ? value.length : 0;
  const fieldClass = hasError ? 'input-error' : hasSuccess ? 'input-success' : '';

  const handleClear = () => {
    onChange({ target: { name, value: '' } });
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange,
      onBlur,
      disabled,
      placeholder,
      'aria-describedby': [
        help && !hasError ? `${fieldId}-help` : null,
        hasError ? `${fieldId}-error` : null,
      ].filter(Boolean).join(' ') || undefined,
      'aria-invalid': hasError || undefined,
      'aria-required': required || undefined,
      maxLength,
      ref,
      ...props,
    };

    if (type === 'textarea') {
      return (
        <div className="input-wrapper">
          <textarea
            {...commonProps}
            rows={rows}
            className={`input ${fieldClass}`}
          />
          {showCount && maxLength && (
            <span className={`char-counter${charCount >= maxLength ? ' char-counter-limit' : ''}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <select {...commonProps} className={`input ${fieldClass}`}>
          {children || options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'checkbox') {
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
    }

    if (type === 'radio') {
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
    }

    const hasSuffix = isPassword || clearable || suffix;
    const hasPrefix = !!prefix;

    return (
      <div className={`input-wrapper${hasPrefix ? ' has-prefix' : ''}${hasSuffix ? ' has-suffix' : ''}`}>
        {hasPrefix && <span className="input-prefix">{prefix}</span>}
        <input
          {...commonProps}
          type={actualType}
          className={`input ${fieldClass}${hasPrefix ? ' input-with-prefix' : ''}${hasSuffix ? ' input-with-suffix' : ''}`}
        />
        {hasSuffix && (
          <span className="input-suffix-actions">
            {clearable && value && !disabled && (
              <button
                type="button"
                className="input-action-btn"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="مسح"
              >
                <FaTimes size={11} />
              </button>
            )}
            {suffix && !isPassword && (
              <span className="input-suffix-icon">{suffix}</span>
            )}
            {isPassword && (
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            )}
          </span>
        )}
        {showCount && maxLength && (
          <span className={`char-counter${charCount >= maxLength ? ' char-counter-limit' : ''}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
  };

  if (type === 'checkbox') {
    return renderInput();
  }

  return (
    <div className={`form-group ${required ? 'required' : ''} ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={fieldId} className="form-label">
          {icon && <span className="form-label-icon">{icon}</span>}
          {label}
          {required && <span className="form-required-mark" aria-hidden="true"> *</span>}
        </label>
      )}

      {renderInput()}

      {help && !hasError && (
        <div id={`${fieldId}-help`} className="form-help">
          {help}
        </div>
      )}

      {hasError && (
        <div id={`${fieldId}-error`} className="form-error" role="alert">
          <FaExclamationCircle size={12} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {hasSuccess && (
        <div className="form-success">
          <FaCheckCircle size={12} style={{ flexShrink: 0 }} />
          {success}
        </div>
      )}
    </div>
  );
});

export default FormField;