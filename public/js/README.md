# JavaScript Organization Structure

This directory contains organized JavaScript files for the UC FMO application.

## Directory Structure

```
public/js/
├── components/          # Reusable UI components
│   └── modern-filter.js # Modern filter component with trendy UI
├── utils/              # Utility functions and managers
│   └── forms-manager.js # Forms management utility
└── README.md           # This file
```

## Components

### ModernFilter (`/js/components/modern-filter.js`)

A modern, trendy filter component with the following features:

- **Collapsible interface** with smooth animations
- **Real-time search** with debounced input
- **Multiple filter types**: Status, Form Type, Date Range
- **Responsive design** that works on all devices
- **Gradient styling** with modern UI trends
- **Event-driven architecture** with callbacks

#### Usage:
```javascript
const filter = new ModernFilter('containerId', {
    showSearch: true,
    showStatus: true,
    showType: true,
    placeholder: 'Search...',
    onFilter: (filters) => {
        // Handle filter changes
    },
    onClear: () => {
        // Handle filter clear
    }
});
```

### FormsManager (`/js/utils/forms-manager.js`)

A comprehensive forms management utility that handles:

- **Form loading** with pagination
- **Filter application** and management
- **Statistics calculation** and display
- **PDF operations** (preview/download)
- **Error handling** and loading states
- **Admin/User mode** support

#### Usage:
```javascript
const formsManager = new FormsManager({
    apiEndpoint: '/api/sarf/my-all-forms',
    itemsPerPage: 4,
    isAdmin: false,
    containerId: 'formsContainer',
    paginationId: 'pagination',
    statsEnabled: true
});

// Load forms
formsManager.loadForms();

// Apply filters
formsManager.applyFilters({ status: 'pending', type: 'campus' });
```

## CSS Styling

The components use modern CSS located in:
- `/css/components/modern-filter.css` - Complete styling for filter and forms

## Features

### Modern Filter UI
- **Gradient backgrounds** with glassmorphism effects
- **Smooth animations** and hover effects
- **Responsive grid layout** for filters
- **Icon integration** with Font Awesome
- **Color-coded status badges** and form types
- **Professional button styling** with gradients

### Advanced Functionality
- **Real-time search** with 300ms debounce
- **Multiple filter combinations** (status + type + search)
- **Pagination** with smart page number display
- **Statistics dashboard** with real-time updates
- **Error handling** with user-friendly messages
- **Loading states** with animated spinners

### Responsive Design
- **Mobile-first approach** with breakpoints
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly** buttons and interactions
- **Optimized typography** for readability

## Integration

Both components are designed to work together:

1. **ModernFilter** handles the UI and user interactions
2. **FormsManager** handles the data and API calls
3. **CSS** provides the modern, trendy styling

This creates a cohesive, professional user experience for both user and admin interfaces.

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support
- Fetch API support
- Font Awesome 6.x compatibility

## Dependencies

- Font Awesome 6.x (for icons)
- Modern browser with ES6+ support
- Existing modal and navbar utilities
