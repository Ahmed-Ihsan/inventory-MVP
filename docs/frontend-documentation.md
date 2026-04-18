# Frontend Documentation

## Overview
The Inventory Management frontend is built with React and provides a modern, professional interface with comprehensive features for managing inventory, stock tracking, and barcode scanning.

## Technology Stack
- **React 19** - UI framework
- **React Router DOM** - Navigation
- **React i18next** - Internationalization
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **CSS Variables** - Theming system

## File Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA configuration
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   │   ├── Button.js           # Styled button component
│   │   │   ├── Input.js            # Form input component
│   │   │   ├── Modal.js            # Modal dialog component
│   │   │   ├── Table.js            # Data table component
│   │   │   ├── Card.js             # Content card component
│   │   │   ├── Loading.js          # Loading spinner
│   │   │   ├── SkeletonLoader.js   # Skeleton loading screens
│   │   │   ├── StatusBadge.js      # Status indicator badges
│   │   │   ├── Tooltip.js          # Help tooltips
│   │   │   ├── EmptyState.js       # Empty state illustrations
│   │   │   ├── Pagination.js       # Pagination controls
│   │   │   ├── ProgressIndicator.js # Progress bars & step indicators
│   │   │   ├── Breadcrumbs.js      # Navigation breadcrumbs
│   │   │   ├── AdvancedModal.js    # Multi-step & confirmation modals
│   │   │   └── DashboardCharts.js  # Data visualization charts
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.js           # App header with navigation
│   │   │   ├── Sidebar.js          # Navigation sidebar
│   │   │   └── Footer.js           # App footer
│   │   ├── items/          # Item management components
│   │   │   ├── ItemList.js         # Item listing with search/sort
│   │   │   └── ItemForm.js         # Item creation/editing form
│   │   ├── stock/          # Stock management components
│   │   │   ├── StockList.js        # Stock levels display
│   │   │   └── StockForm.js        # Stock adjustment form
│   │   ├── scanning/       # Barcode scanning components
│   │   │   ├── Scanner.js          # Camera interface
│   │   │   └── ScanResult.js       # Scan results display
│   │   └── auth/           # Authentication components
│       ├── LoginForm.js            # Login form
│       └── RegisterForm.js         # Registration form
│   ├── pages/              # Page components
│   │   ├── Dashboard.js            # Main dashboard
│   │   ├── ItemCatalog.js          # Item management page
│   │   ├── StockTracking.js        # Stock tracking page
│   │   ├── Scanning.js             # Barcode scanning page
│   │   └── Login.js                # Authentication page
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js              # Authentication state
│   │   ├── useItems.js             # Item data management
│   │   ├── useStock.js             # Stock data management
│   │   └── useAlerts.js            # Alert notifications
│   ├── utils/              # Utility functions
│   │   ├── api.js                  # API client
│   │   └── constants.js            # App constants
│   ├── context/            # React context providers
│   │   ├── ThemeContext.js         # Dark/light theme
│   │   ├── ToastContext.js         # Notification system
│   │   └── AuthContext.js          # Authentication context
│   ├── locales/            # Translation files
│   │   ├── en.json                 # English translations
│   │   └── ar.json                 # Arabic translations
│   ├── styles/
│   │   ├── global.css              # Global styles & CSS variables
│   │   └── theme.js                # Theme configuration
│   ├── i18n.js             # i18n configuration
│   ├── App.js              # Main app component
│   └── index.js            # App entry point
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

## Key Features

### 🎨 **Theming & Styling**
- **CSS Variables**: Comprehensive theming system with light/dark mode support
- **Responsive Design**: Mobile-first approach with breakpoints
- **RTL Support**: Full Arabic right-to-left layout support
- **Animations**: Smooth transitions and micro-interactions

### 🔍 **Data Management**
- **Search & Filtering**: Real-time search across item catalog
- **Sorting**: Clickable column headers with visual indicators
- **Pagination**: Efficient data loading with pagination controls
- **Status Indicators**: Color-coded badges for item/stock status

### 📊 **Data Visualization**
- **Interactive Charts**: Bar charts for stock levels, pie charts for categories
- **Responsive Charts**: Mobile-optimized data visualization
- **Real-time Updates**: Dynamic chart updates with data changes

### 🎯 **User Experience**
- **Loading States**: Skeleton screens and progress indicators
- **Empty States**: Contextual illustrations for empty data
- **Toast Notifications**: Non-intrusive feedback messages
- **Tooltips**: Contextual help and information

### 📱 **Responsive & Accessible**
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Touch-Friendly**: Optimized button sizes and spacing
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML

## Component API

### Common Components

#### Button
```jsx
<Button
  onClick={handleClick}
  type="button"
  disabled={false}
  className="btn-primary"
>
  Click me
</Button>
```

#### Input
```jsx
<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={handleChange}
  required
/>
```

#### Table
```jsx
<Table
  columns={[
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' }
  ]}
  data={users}
/>
```

#### Modal
```jsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
>
  <p>Are you sure?</p>
</Modal>
```

### Advanced Components

#### SkeletonLoader
```jsx
<SkeletonLoader type="card" count={3} />
<SkeletonLoader type="table" />
```

#### StatusBadge
```jsx
<StatusBadge status="active" />
<PriorityBadge priority="high" />
```

#### Tooltip
```jsx
<Tooltip content="Help text" place="top">
  <span>Hover me</span>
</Tooltip>
```

#### EmptyState
```jsx
<EmptyState
  type="no-data"
  title="No items found"
  actionLabel="Add Item"
  onAction={handleAdd}
/>
```

#### Pagination
```jsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={setCurrentPage}
/>
```

#### DashboardCharts
```jsx
<DashboardCharts
  items={items}
  alerts={alerts}
/>
```

## Styling System

### CSS Variables
The app uses CSS custom properties for consistent theming:

```css
:root {
  --color-primary: #2563eb;
  --color-background: #f1f5f9;
  --spacing-md: 1rem;
  --border-radius-md: 0.5rem;
  /* ... more variables */
}
```

### Dark Mode
Automatic dark mode switching with data attributes:

```css
[data-theme="dark"] {
  --color-background: #111827;
  --color-card-background: #1f2937;
  /* ... dark theme overrides */
}
```

### Responsive Breakpoints
- Mobile: < 576px
- Tablet: 576px - 768px
- Desktop: > 768px

## Internationalization

### Supported Languages
- Arabic (ar) - Default
- English (en)

### Translation Keys Structure
```json
{
  "nav": {
    "dashboard": "لوحة التحكم"
  },
  "items": {
    "name": "الاسم",
    "addNewItem": "إضافة عنصر جديد"
  }
}
```

### Usage in Components
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('nav.dashboard')}</h1>;
}
```

## State Management

### Context Providers
- **ThemeContext**: Manages light/dark theme switching
- **ToastContext**: Handles notification display
- **AuthContext**: Manages authentication state

### Custom Hooks
- **useAuth**: Authentication state and actions
- **useItems**: Item data fetching and mutations
- **useStock**: Stock data management
- **useAlerts**: Alert notifications

## API Integration

### API Client
Centralized API client with error handling:

```javascript
import { apiRequest } from './utils/api';

// GET request
const data = await apiRequest('/items');

// POST request
const result = await apiRequest('/items', {
  method: 'POST',
  body: JSON.stringify(itemData)
});
```

### Error Handling
- Network error handling
- Authentication error redirects
- User-friendly error messages

## Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy
- Component lazy loading

### Image Optimization
- Responsive images
- Lazy loading for off-screen content

### Bundle Optimization
- Tree shaking
- Dead code elimination
- CSS minification

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject from create-react-app
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## Deployment

### Build Process
```bash
npm run build
# Output in build/ directory
```

### PWA Features
- Service worker for offline support
- Web app manifest
- Install prompt support

## Testing

### Component Testing
- Jest for unit tests
- React Testing Library for component tests
- Mock API calls

### E2E Testing
- Playwright for end-to-end tests
- Cross-browser testing

## Accessibility

### WCAG 2.1 Compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast ratios
- Screen reader support

## Future Enhancements

- **PWA Features**: Offline functionality, push notifications
- **Advanced Charts**: More chart types, real-time updates
- **Drag & Drop**: File uploads, item reordering
- **Real-time Updates**: WebSocket integration
- **Advanced Search**: Filters, facets, saved searches
- **Export Features**: PDF reports, CSV exports
- **User Preferences**: Customizable themes, layouts