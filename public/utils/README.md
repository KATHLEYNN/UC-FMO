# Reusable Navbar Component

This folder contains reusable navbar components for the UC Campus Management System.

## Files

- `navbar.js` - JavaScript functions for generating navbars
- `navbar.css` - Modern styling for the navbars
- `README.md` - This documentation file

## Usage

### 1. Include the required files in your HTML

```html
<head>
    <!-- Include Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Include navbar CSS -->
    <link rel="stylesheet" href="/utils/navbar.css">
</head>
<body>
    <!-- Add navbar container -->
    <div id="navbar-container"></div>
    
    <!-- Your page content -->
    
    <!-- Include navbar JavaScript -->
    <script src="/utils/navbar.js"></script>
</body>
```

### 2. Initialize the navbar

#### For Admin Pages:
```javascript
// Initialize admin navbar with 'dashboard' as active page
initializeNavbar('admin', 'dashboard');

// Available admin pages: 'dashboard', 'calendar', 'pending', 'reports'
```

#### For User Pages (Student/External):
```javascript
// Initialize user navbar for student
initializeNavbar('user', 'home', 'student');

// Initialize user navbar for external user
initializeNavbar('user', 'reservation', 'external');

// Available user pages: 'home', 'reservation', 'campus', 'inquire'
```

### 3. Function Parameters

```javascript
initializeNavbar(navbarType, activePage, userRole)
```

- `navbarType` (string): 'admin' or 'user'
- `activePage` (string): The currently active page (optional)
- `userRole` (string): 'student' or 'external' (only for user navbar)

## Features

### Admin Navbar
- Dashboard link
- Calendar link
- Pending items link
- Reports link
- Admin user indicator
- Logout button

### User Navbar
- Home link
- Reservation link
- Campus dropdown (Main Campus, Legarda Campus)
- Inquire link
- Role indicator (Student/External)
- Logout button

### Design Features
- Modern gradient background
- Smooth animations and transitions
- Responsive design for mobile devices
- Dropdown functionality
- Active page highlighting
- Hover effects with shimmer animation
- Sticky positioning

## Customization

### Adding New Links

To add new links to the navbar, edit the `generateAdminNavbar()` or `generateUserNavbar()` functions in `navbar.js`.

### Styling Changes

Modify `navbar.css` to change colors, fonts, or layout. The CSS uses CSS custom properties for easy theming.

### Icons

The navbar uses Font Awesome icons. You can change icons by modifying the `<i class="fas fa-icon-name"></i>` elements in the navbar generation functions.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Font Awesome 6.0+ (for icons)
- Modern browser with CSS Grid and Flexbox support
