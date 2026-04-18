# Frontend - Inventory Management System

A modern, responsive React application for inventory management with Arabic RTL support and professional UI components.

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```
Runs the app in development mode on [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, Modal, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── items/          # Item management components
│   ├── stock/          # Stock management components
│   ├── scanning/       # Barcode scanning components
│   └── auth/           # Authentication components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── context/            # React context providers
├── locales/            # Translation files (Arabic & English)
├── styles/             # Global styles and theme configuration
├── i18n.js            # Internationalization setup
├── App.js             # Main app component
└── index.js           # App entry point
```

## 🎨 Key Features

### ✨ **Modern UI/UX**
- **Professional Design System**: Enterprise-ready interface with consistent styling
- **Dark/Light Theme**: Complete theme switching with user preference persistence
- **Arabic RTL Support**: Full right-to-left layout and text direction
- **Responsive Design**: Mobile-first approach with adaptive components
- **Smooth Animations**: CSS transitions and micro-interactions

### 📊 **Advanced Components**
- **Interactive Charts**: Stock levels and category distribution visualizations
- **Skeleton Loading**: Smooth loading states with skeleton screens
- **Status Badges**: Color-coded status indicators for items and stock
- **Tooltips**: Contextual help and information overlays
- **Pagination**: Efficient data browsing with navigation controls
- **Empty States**: Beautiful placeholder illustrations
- **Progress Indicators**: Loading bars and step indicators

### 🔍 **Data Management**
- **Real-time Search**: Live filtering across item catalog
- **Column Sorting**: Clickable headers with visual sort indicators
- **Advanced Tables**: Status integration and responsive design
- **Form Validation**: Input validation with helpful error messages

### 🌐 **Internationalization**
- **Multi-language Support**: Arabic (primary) and English
- **Persistent Language**: User language choice saved automatically
- **Cultural Adaptation**: RTL layout and Arabic-specific styling

## 🛠️ Usage Examples

### Basic Component Usage
```jsx
import { Button, Input, Card } from './components/common';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter item name" />
      <Button onClick={handleSubmit}>Save Item</Button>
    </Card>
  );
}
```

### Using Hooks
```jsx
import { useItems } from './hooks/useItems';

function ItemManager() {
  const { items, loading, addItem } = useItems();

  return (
    <div>
      {loading ? <SkeletonLoader /> : items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

### Theme Integration
```jsx
import { useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

## 🎨 Styling System

### CSS Variables
The app uses a comprehensive theming system:

```css
:root {
  --color-primary: #2563eb;
  --color-background: #f1f5f9;
  --spacing-md: 1rem;
  --border-radius-md: 0.5rem;
  /* ... 50+ variables */
}
```

### Dark Mode
Automatic theme switching with data attributes:

```css
[data-theme="dark"] {
  --color-background: #111827;
  --color-text: #f9fafb;
  /* ... complete dark theme */
}
```

## 🌐 Internationalization

### Supported Languages
- **Arabic (ar)** - Default language with RTL support
- **English (en)** - Secondary language

### Translation Usage
```jsx
import { useTranslation } from 'react-i18next';

function Navigation() {
  const { t } = useTranslation();

  return <nav>{t('nav.dashboard')}</nav>;
}
```

## 🔧 Development Guidelines

### Component Structure
- Use functional components with React hooks
- Implement proper PropTypes for type checking
- Follow consistent naming conventions
- Keep components small and focused

### State Management
- Local state with `useState` for component-specific data
- Global state through React Context (Theme, Auth, Toast)
- Custom hooks for reusable logic
- Avoid unnecessary re-renders

### Performance
- Use `React.memo` for expensive components
- Implement lazy loading for routes and images
- Optimize bundle size with code splitting
- Use React DevTools for performance monitoring

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: > 768px

### Mobile Features
- Hamburger navigation menu
- Touch-optimized button sizes
- Swipe gestures (framework ready)
- Responsive chart containers

## 🧪 Testing

### Available Scripts
```bash
npm test           # Run test suite
npm test -- --watchAll=false  # Run tests once
npm test -- --coverage       # Generate coverage report
```

### Testing Examples
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './components/common/Button';

test('button click works', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Create `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

### Static Hosting
Deploy the `build` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📊 Progressive Web App

### PWA Features
- Service worker for offline caching
- Web app manifest for installation
- Install prompt support
- Offline page fallback

### Configuration
- `public/manifest.json` - App metadata
- Service worker automatically generated

## 🤝 Contributing

1. Follow the established component patterns
2. Use the theme system for consistent styling
3. Add translations for new text content
4. Ensure responsive design
5. Write tests for new components
6. Update documentation

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Consistent import ordering
- Meaningful commit messages

## 📄 License

Part of the Inventory Management System - Full project documentation available in `/docs`.

## 🆘 Troubleshooting

### Common Issues

**Theme not switching**
- Ensure ThemeProvider wraps the App component
- Check localStorage for theme preference

**Translations not loading**
- Verify i18n.js is imported in index.js
- Check locale file syntax

**Charts not rendering**
- Ensure Recharts is properly installed
- Check data format matches chart requirements

**Mobile menu not working**
- Verify viewport meta tag in index.html
- Check CSS media queries

## 📞 Support

For frontend-specific issues:
1. Check the component documentation
2. Review the styling system
3. Test in different browsers
4. Check console for errors

For general project issues, refer to the main project documentation.
