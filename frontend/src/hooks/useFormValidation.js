import { useState, useCallback } from 'react';

/**
 * useFormValidation — centralized form state + validation
 *
 * @param {object} initialValues  - initial field values
 * @param {object} validators     - { fieldName: (value, allValues) => errorString | '' }
 */
const useFormValidation = (initialValues, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name, value, currentValues) => {
      if (!validators[name]) return '';
      return validators[name](value, currentValues || values) || '';
    },
    [validators, values]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;
      setValues((prev) => {
        const next = { ...prev, [name]: newValue };
        if (touched[name]) {
          const err = validateField(name, newValue, next);
          setErrors((prevErr) => ({ ...prevErr, [name]: err }));
        }
        return next;
      });
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    },
    [validateField]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    Object.keys(validators).forEach((name) => {
      const err = validateField(name, values[name]);
      if (err) {
        newErrors[name] = err;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    return isValid;
  }, [validators, validateField, values]);

  const reset = useCallback(
    (overrideValues) => {
      setValues(overrideValues || initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    setValues,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  };
};

export default useFormValidation;
