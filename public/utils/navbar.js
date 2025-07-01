function generateAdminNavbar(activePage = '') {
    return `
        <nav class="navbar">
            <div class="navbar-brand">
                <img src="/images/UC_LOGO.png" alt="UC Logo" class="navbar-logo">
                <span class="navbar-title">UC Admin Panel</span>
            </div>
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a href="/admin/admin" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                        <i class="fas fa-chart-dashboard"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/admin/calendar" class="nav-link ${activePage === 'calendar' ? 'active' : ''}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Calendar</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link ${activePage === 'pending' ? 'active' : ''}">
                        <i class="fas fa-clock"></i>
                        <span>Pending</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
                        <i class="fas fa-file-alt"></i>
                        <span>Reports</span>
                    </a>
                </li>
            </ul>
            <div class="navbar-user">
                <div class="user-info">
                    <i class="fas fa-user-shield"></i>
                    <span class="user-role">Admin</span>
                </div>
                <button onclick="handleLogout()" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    `;
}

function generatePublicNavbar(activePage = '') {
    return `
        <nav class="navbar">
            <div class="navbar-brand">
                <img src="/images/UC_LOGO.png" alt="UC Logo" class="navbar-logo">
                <span class="navbar-title">UC Campus</span>
            </div>
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link ${activePage === 'about' ? 'active' : ''}">
                        <i class="fas fa-info-circle"></i>
                        <span>About</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link ${activePage === 'contact' ? 'active' : ''}">
                        <i class="fas fa-envelope"></i>
                        <span>Contact</span>
                    </a>
                </li>
            </ul>
            <div class="navbar-user">
                <a href="/login" class="nav-link-btn ${activePage === 'login' ? 'active' : ''}">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                </a>
                <a href="/signup" class="nav-link-btn signup-btn ${activePage === 'signup' ? 'active' : ''}">
                    <i class="fas fa-user-plus"></i>
                    <span>Sign Up</span>
                </a>
            </div>
        </nav>
    `;
}

function generateUserNavbar(activePage = '', userRole = 'student') {
    const roleIcon = userRole === 'student' ? 'fas fa-user-graduate' : 'fas fa-user';
    const roleLabel = userRole === 'student' ? 'Student' : 'External';
    
    return `
        <nav class="navbar">
            <div class="navbar-brand">
                <img src="/images/UC_LOGO.png" alt="UC Logo" class="navbar-logo">
                <span class="navbar-title">UC Campus</span>
            </div>
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a href="/user/home" class="nav-link ${activePage === 'home' ? 'active' : ''}">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/user/reservation" class="nav-link ${activePage === 'reservation' ? 'active' : ''}">
                        <i class="fas fa-calendar-check"></i>
                        <span>Reservation</span>
                    </a>
                </li>
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle ${activePage === 'campus' ? 'active' : ''}" data-toggle="dropdown">
                        <i class="fas fa-building"></i>
                        <span>Campus</span>
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/user/main-campus" class="dropdown-link">Main Campus</a></li>
                        <li><a href="/user/legarda-campus" class="dropdown-link">Legarda Campus</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link ${activePage === 'inquire' ? 'active' : ''}" onclick="alert('Inquire feature coming soon!')">
                        <i class="fas fa-question-circle"></i>
                        <span>Inquire</span>
                    </a>
                </li>
            </ul>
            <div class="navbar-user">
                <div class="user-info">
                    <i class="${roleIcon}"></i>
                    <span class="user-role">${roleLabel}</span>
                </div>
                <button onclick="handleLogout()" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    `;
}

function initializeNavbar(navbarType, activePage = '', userRole = 'student') {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.error('Navbar container not found. Please add <div id="navbar-container"></div> to your HTML.');
        return;
    }

    let navbarHTML = '';
    if (navbarType === 'admin') {
        navbarHTML = generateAdminNavbar(activePage);
    } else if (navbarType === 'user') {
        navbarHTML = generateUserNavbar(activePage, userRole);
    } else if (navbarType === 'public') {
        navbarHTML = generatePublicNavbar(activePage);
    }

    navbarContainer.innerHTML = navbarHTML;

    initializeDropdowns();
}

function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.parentElement;
            const menu = dropdown.querySelector('.dropdown-menu');
            
            document.querySelectorAll('.nav-item.dropdown').forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('show');
                }
            });
            
            dropdown.classList.toggle('show');
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.nav-item.dropdown').forEach(item => {
                item.classList.remove('show');
            });
        }
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', function() {
    // test for future ko to
});
