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

---

# Reusable Modal System

The modal system provides confirmation, success, and error modals for user interactions.

## Files

- `modals.js` - JavaScript functions for modal management
- `modals.css` - Styling for all modal types

## Usage

### 1. Include the required files in your HTML

```html
<head>
    <!-- Include Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Include modal CSS -->
    <link rel="stylesheet" href="/utils/modals.css">
</head>
<body>
    <!-- Your page content -->

    <!-- Include modal JavaScript -->
    <script src="/utils/modals.js"></script>
</body>
```

### 2. Modal Functions

#### Confirmation Modal
```javascript
// Basic confirmation
showConfirmationModal({
    title: 'Delete Event',
    message: 'Are you sure you want to delete this event? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger'
}).then(confirmed => {
    if (confirmed) {
        // User clicked confirm
        deleteEvent();
    }
});

// With callbacks
showConfirmationModal({
    title: 'Save Changes',
    message: 'Do you want to save your changes?',
    type: 'info',
    onConfirm: () => saveData(),
    onCancel: () => console.log('Cancelled')
});
```

#### Success Modal
```javascript
// Basic success
showSuccessModal({
    title: 'Event Created!',
    message: 'Your event has been successfully created and will appear on the home page.',
    buttonText: 'Great!'
});

// Auto-close after 3 seconds
showSuccessModal({
    title: 'Saved!',
    message: 'Your changes have been saved.',
    autoClose: 3000,
    onClose: () => window.location.reload()
});
```

#### Error Modal
```javascript
showErrorModal({
    title: 'Upload Failed',
    message: 'The file could not be uploaded. Please check the file size and format.',
    buttonText: 'Try Again'
});
```

### 3. Modal Types

- `danger` - Red theme for destructive actions
- `warning` - Yellow theme for warnings
- `info` - Blue theme for information (default)
- `success` - Green theme for success messages

### 4. Features

- **Responsive design** - Works on all screen sizes
- **Keyboard support** - ESC key closes modals
- **Click outside to close** - Click overlay to dismiss
- **Smooth animations** - CSS transitions and transforms
- **Promise-based** - Easy async/await usage
- **Auto-close option** - For success modals
- **Accessibility** - Focus management and ARIA support

### 5. Examples for UC Campus System

#### Event Deletion
```javascript
async function deleteEvent(eventId) {
    const confirmed = await showConfirmationModal({
        title: 'Delete Event',
        message: 'Are you sure you want to delete this event?',
        confirmText: 'Delete',
        type: 'danger'
    });

    if (confirmed) {
        try {
            await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
            await showSuccessModal({
                title: 'Event Deleted',
                message: 'The event has been successfully deleted.'
            });
            loadEvents(); // Refresh the list
        } catch (error) {
            showErrorModal({
                title: 'Delete Failed',
                message: 'Could not delete the event. Please try again.'
            });
        }
    }
}
```

#### Form Submission
```javascript
async function submitReservation(formData) {
    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            await showSuccessModal({
                title: 'Reservation Submitted!',
                message: 'Your reservation request has been submitted successfully. You will receive a confirmation email shortly.',
                autoClose: 5000
            });
            form.reset();
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        showErrorModal({
            title: 'Submission Failed',
            message: 'Could not submit your reservation. Please check your connection and try again.'
        });
    }
}
```
