# Input Formats Documentation

This document provides a comprehensive overview of all input formats, field types, and validation rules used throughout the Inventory Management System.

---

## Table of Contents
- [FormField Component](#formfield-component)
- [Supported Input Types](#supported-input-types)
- [Input Fields by Module](#input-fields-by-module)
- [Validation Rules](#validation-rules)
- [Common Patterns](#common-patterns)

---

## FormField Component

The `FormField` component is a reusable form input component located at `src/components/common/FormField.js`. It supports multiple input types and provides built-in validation, error handling, and accessibility features.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label text |
| `name` | string | - | Field name (for form state) |
| `type` | string | `'text'` | Input type (see Supported Types below) |
| `value` | any | - | Field value |
| `onChange` | function | - | Change handler function |
| `onBlur` | function | - | Blur handler function |
| `error` | string | - | Error message to display |
| `success` | string | - | Success message to display |
| `help` | string | - | Helper text below the field |
| `required` | boolean | `false` | Marks field as required |
| `disabled` | boolean | `false` | Disables the field |
| `placeholder` | string | - | Placeholder text |
| `options` | array | `[]` | Options for select/radio/checkbox |
| `rows` | number | `3` | Number of rows for textarea |
| `className` | string | `''` | Additional CSS classes |
| `icon` | ReactNode | - | Icon to display in label |
| `prefix` | string/ReactNode | - | Prefix text/icon |
| `suffix` | string/ReactNode | - | Suffix text/icon |
| `clearable` | boolean | `false` | Shows clear button for text inputs |
| `maxLength` | number | - | Maximum character length |
| `showCount` | boolean | `false` | Shows character count for text/textarea |
| `children` | ReactNode | - | Child elements (for select options) |

---

## Supported Input Types

### 1. Text Input (`type="text"`)
Standard text input for short text values.

**Common Uses:**
- Names (customer, supplier, item)
- Phone numbers
- SKUs
- Reference numbers
- Bank names
- Check numbers

**Example:**
```jsx
<FormField 
  label="اسم العميل" 
  name="customer_name" 
  type="text" 
  value={value} 
  onChange={handleChange}
  required
  clearable
  placeholder="أدخل اسم العميل"
/>
```

**Validation:**
- `required`: Field must not be empty
- `minLength`: Minimum length check (custom validator)
- `maxLength`: Maximum length (via `maxLength` prop)

---

### 2. Number Input (`type="number"`)
Numeric input for quantities, prices, and amounts.

**Common Uses:**
- Prices (cost, selling, total)
- Quantities
- Stock levels
- Payment amounts
- Minimum stock levels

**Example:**
```jsx
<FormField 
  label="السعر" 
  name="price" 
  type="number" 
  value={value} 
  onChange={handleChange}
  required
  min="0"
  step="0.01"
  prefix="IQD"
/>
```

**Attributes:**
- `min`: Minimum value (usually 0)
- `max`: Maximum value
- `step`: Decimal step (0.01 for currency, 1 for integers)

**Validation:**
- `required`: Field must not be empty
- `min`: Value must be >= minimum
- `max`: Value must be <= maximum
- Non-negative for prices/amounts

---

### 3. Select Input (`type="select"`)
Dropdown selection for predefined options.

**Common Uses:**
- Categories
- Payment methods
- Payment types
- Statuses
- Units of measure
- Items

**Example:**
```jsx
<FormField 
  label="الفئة" 
  name="category_id" 
  type="select" 
  value={value} 
  onChange={handleChange}
  required
>
  <option value="">-- اختر الفئة --</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</FormField>
```

**Or using options prop:**
```jsx
<FormField 
  label="طريقة الدفع" 
  name="payment_method" 
  type="select" 
  value={value} 
  onChange={handleChange}
  options={[
    { value: 'cash', label: 'نقداً' },
    { value: 'card', label: 'بطاقة' },
    { value: 'credit', label: 'آجل' },
  ]}
/>
```

---

### 4. Textarea Input (`type="textarea"`)
Multi-line text input for descriptions and notes.

**Common Uses:**
- Item descriptions
- Notes
- Payment descriptions
- Purchase descriptions

**Example:**
```jsx
<FormField 
  label="الوصف" 
  name="description" 
  type="textarea" 
  value={value} 
  onChange={handleChange}
  rows={3}
  maxLength={300}
  showCount
/>
```

**Attributes:**
- `rows`: Number of visible rows (default: 3)
- `maxLength`: Maximum character limit
- `showCount`: Displays character count (X/Y)

---

### 5. Password Input (`type="password"`)
Password field with show/hide toggle.

**Common Uses:**
- User passwords
- Sensitive fields

**Example:**
```jsx
<FormField 
  label="كلمة المرور" 
  name="password" 
  type="password" 
  value={value} 
  onChange={handleChange}
  required
/>
```

**Features:**
- Eye icon to toggle visibility
- Auto-masking by default

---

### 6. Checkbox Input (`type="checkbox"`)
Single checkbox for boolean values.

**Common Uses:**
- Boolean flags
- Agreements
- Toggles

**Example:**
```jsx
<FormField 
  label="تفعيل التنبيهات" 
  name="notifications_enabled" 
  type="checkbox" 
  value={value} 
  onChange={handleChange}
/>
```

---

### 7. Radio Input (`type="radio"`)
Radio button group for single selection from options.

**Common Uses:**
- Exclusive choices
- Preference settings

**Example:**
```jsx
<FormField 
  label="الأولوية" 
  name="priority" 
  type="radio" 
  value={value} 
  onChange={handleChange}
  options={[
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' },
  ]}
/>
```

---

### 8. Date Input (`type="date"`)
Date picker for date selection.

**Common Uses:**
- Expiry dates
- Purchase dates
- Transaction dates

**Example:**
```jsx
<FormField 
  label="تاريخ الصلاحية" 
  name="expiry_date" 
  type="date" 
  value={value} 
  onChange={handleChange}
  help="تاريخ انتهاء الصلاحية (للأصناف القابلة للتلف)"
/>
```

---

### 9. DateTime-Local Input (`type="datetime-local"`)
Date and time picker for precise timestamps.

**Common Uses:**
- Transaction timestamps
- Due dates
- Payment dates

**Example:**
```jsx
<FormField 
  label="تاريخ المعاملة" 
  name="transaction_date" 
  type="datetime-local" 
  value={value} 
  onChange={handleChange}
  required
/>
```

---

## Input Fields by Module

### Items Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | text | Yes | min 2 chars | Item name |
| `sku` | text | Yes | unique | Stock Keeping Unit |
| `description` | textarea | No | max 300 chars | Item description |
| `price` | number | Yes | >= 0 | Selling price |
| `category_id` | select | Yes | valid category | Category reference |
| `min_stock_level` | number | Yes | >= 0 | Minimum stock threshold |
| `initial_stock` | number | No | >= 0 | Opening stock quantity |
| `supplier` | text | No | - | Supplier name |
| `unit_of_measure` | select | No | piece/kg/liter/box/pack/meter | Unit type |
| `expiry_date` | date | No | valid date | Expiration date |
| `batch_number` | text | No | - | Batch/lot number |

---

### Sales Invoice Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `customer_name` | text | Yes | not empty | Customer name |
| `customer_phone` | text | No | - | Customer phone |
| `item_id` | select | Yes | valid item | Selected item |
| `quantity` | number | Yes | >= 1 | Item quantity |
| `cost_price` | number | No | >= 0 | Cost price |
| `selling_price` | number | Yes | >= 0 | Selling price |
| `total_amount` | number | Yes | >= 0 | Invoice total |
| `paid_amount` | number | Yes | >= 0 | Amount paid |
| `payment_method` | select | Yes | cash/card/credit | Payment method |
| `notes` | textarea | No | - | Invoice notes |

---

### Purchases Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `supplier_name` | text | Yes | not empty | Supplier name |
| `total_amount` | number | Yes | >= 0 | Purchase total |
| `paid_amount` | number | Yes | >= 0 | Amount paid |
| `payment_method` | select | Yes | cash/installment | Payment method |
| `description` | textarea | No | - | Purchase notes |

**Payment Form (Installments):**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `customer_name` | text | Yes | not empty | Customer name |
| `customer_phone` | text | No | - | Customer phone |
| `amount` | number | Yes | >= 0 | Payment amount |
| `payment_method` | select | Yes | - | Payment method |
| `reference_number` | text | No | - | Reference number |
| `notes` | textarea | No | - | Payment notes |

---

### Payments Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `payment_type` | select | Yes | paid/debt/credit | Payment type |
| `amount` | number | Yes | > 0 | Payment amount |
| `description` | textarea | No | - | Payment description |
| `item_id` | select | No | valid item | Linked item |
| `invoice_id` | select | No | valid invoice | Linked invoice |
| `customer_name` | text | No | - | Customer name |
| `customer_phone` | text | No | - | Customer phone |
| `transaction_date` | datetime-local | Yes | valid date | Transaction date |
| `due_date` | datetime-local | Yes (for debt) | valid date | Due date |
| `status` | select | Yes | pending/completed/overdue | Payment status |
| `reference_number` | text | No | - | Reference number |
| `payment_method` | select | No | cash/bank_transfer/check/card | Payment method |
| `bank_name` | text | No | - | Bank name (for transfers) |
| `check_number` | text | No | - | Check number (for checks) |

---

### Categories Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | text | Yes | not empty | Category name |
| `description` | textarea | No | - | Category description |

---

### Stock Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `item_id` | select | Yes | valid item | Item reference |
| `quantity` | number | Yes | integer | Stock quantity |
| `adjustment_type` | select | Yes | add/remove | Adjustment type |

---

### Authentication Module

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `username` | text | Yes | not empty | Username |
| `password` | password | Yes | min 6 chars | Password |
| `email` | text | Yes | valid email | Email address |

---

## Validation Rules

### Common Validators

```javascript
// Text validators
const validators = {
  name: (v) => !v?.trim() ? 'اسم العنصر مطلوب' : v.trim().length < 2 ? 'يجب أن يكون الاسم حرفين على الأقل' : '',
  sku: (v) => !v?.trim() ? 'رمز العنصر (SKU) مطلوب' : '',
  email: (v) => !v?.trim() ? 'البريد الإلكتروني مطلوب' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'بريد إلكتروني غير صالح' : '',
}

// Number validators
const validators = {
  price: (v) => v === '' || v === undefined ? 'السعر مطلوب' : parseFloat(v) < 0 ? 'يجب أن يكون السعر صفرًا أو أكثر' : '',
  quantity: (v) => v === '' || v === undefined ? 'الكمية مطلوبة' : parseInt(v) < 1 ? 'يجب أن تكون الكمية 1 على الأقل' : '',
  amount: (v) => v === '' || v === undefined ? 'المبلغ مطلوب' : parseFloat(v) <= 0 ? 'يجب أن يكون المبلغ أكبر من صفر' : '',
}

// Required field validator
const validators = {
  category_id: (v) => !v ? 'الفئة مطلوبة' : '',
  supplier_name: (v) => !v?.trim() ? 'اسم المورد مطلوب' : '',
}
```

### Custom Validation Patterns

1. **Duplicate SKU Check**
   - Checks if SKU already exists in database
   - Skips check when editing same item

2. **Overpayment Validation**
   - Warns if payment amount exceeds invoice balance
   - Allows confirmation before proceeding

3. **Due Date Required for Debt**
   - Requires due date when payment type is 'debt'
   - Optional for other payment types

4. **Auto-calculate Status**
   - Sets status to 'overdue' if due date has passed
   - Sets status to 'completed' for paid payments

---

## Common Patterns

### 1. Currency Formatting

```javascript
const formatCurrency = (amount) => {
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    numberingSystem: 'latn',
  }).format(amount);
};
```

### 2. Date Formatting

```javascript
// For display
new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')

// For input (datetime-local)
new Date(date).toISOString().slice(0, 16)
```

### 3. Auto-calculation Pattern

```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setValues(prev => ({ ...prev, [name]: value }));
  
  // Auto-calculate related fields
  if (name === 'cost_price' || name === 'selling_price') {
    calculateProfitMargin(
      name === 'cost_price' ? parseFloat(value) || 0 : values.cost_price,
      name === 'selling_price' ? parseFloat(value) || 0 : values.selling_price
    );
  }
};
```

### 4. Dynamic Field Display

```javascript
// Show bank_name only for bank_transfer
{formData.payment_method === 'bank_transfer' && (
  <FormField label="اسم البنك" name="bank_name" type="text" value={formData.bank_name} onChange={handleChange} />
)}

// Show check_number only for check
{formData.payment_method === 'check' && (
  <FormField label="رقم الشيك" name="check_number" type="text" value={formData.check_number} onChange={handleChange} />
)}
```

### 5. Required Field Logic

```javascript
// Required only for specific conditions
required={formData.payment_type === 'debt'}
```

---

## Styling Classes

### Input States
- `.input` - Base input style
- `.input-error` - Error state (red border)
- `.input-success` - Success state (green border)
- `.input-with-prefix` - Has prefix element
- `.input-with-suffix` - Has suffix element

### Form Elements
- `.form-group` - Field container
- `.form-group.required` - Required field indicator
- `.form-label` - Label text
- `.form-required-mark` - Asterisk for required fields
- `.form-help` - Helper text
- `.form-error` - Error message
- `.form-success` - Success message

### Components
- `.input-wrapper` - Input container
- `.input-prefix` - Prefix element
- `.input-suffix-actions` - Suffix container
- `.input-action-btn` - Clear/show-password buttons
- `.char-counter` - Character count display
- `.char-counter-limit` - Limit exceeded state

---

## Accessibility Features

### ARIA Attributes
- `aria-describedby`: Links to help/error messages
- `aria-invalid`: Indicates invalid state
- `aria-required`: Indicates required fields
- `aria-label`: Labels for icon-only buttons

### Keyboard Navigation
- Tab navigation through fields
- Enter key submits forms
- Escape key closes modals
- Ctrl+Shift+Q opens Quick Entry wizard

### Focus States
- Visual focus indicators
- Focus trap in modals
- Auto-focus on first field in modals

---

## Internationalization (i18n)

### Date/Number Formatting
- Arabic locale: `ar-SA`
- English locale: `en-US`
- Currency: IQD
- Numbering system: Latin

### RTL Support
- Automatic RTL/LTR based on language
- Arrow icons flip automatically
- Text alignment adjusts accordingly

---

## Best Practices

1. **Always use FormField component** for consistency
2. **Provide clear labels** and helper text
3. **Use appropriate input types** for data validation
4. **Implement real-time validation** with error messages
5. **Show character counts** for textareas with limits
6. **Use clearable inputs** for optional text fields
7. **Group related fields** logically
8. **Provide currency formatting** for all monetary values
9. **Use date pickers** instead of text inputs for dates
10. **Validate on blur** for better UX

---

## Future Enhancements

- [ ] Add file upload support (images, receipts)
- [ ] Add autocomplete/datalist for common values
- [ ] Add multi-select support
- [ ] Add date range picker
- [ ] Add rich text editor for descriptions
- [ ] Add barcode scanner integration
- [ ] Add masked inputs (phone, credit card)
- [ ] Add validation schemas (Yup/Zod)
- [ ] Add form level validation
- [ ] Add draft auto-save functionality
