// Function to check auth status
async function checkAuthStatus() {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token invalid');
            }

            const data = await response.json();

            if (data.user) {
                return data.user;
            }
            throw new Error('No user data');
        } catch (error) {
            localStorage.removeItem('token');
            return null;
        }
    }
    return null;
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('general-error');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token
            localStorage.setItem('token', data.token);

            // Create a form to handle the redirect with proper headers
            const form = document.createElement('form');
            form.method = 'GET';

            // Redirect based on role: admin goes to admin panel, student/external go to user home
            if (data.user.role === 'admin') {
                form.action = '/admin/admin';
            } else if (data.user.role === 'student' || data.user.role === 'external') {
                form.action = '/home';
            } else {
                // Default fallback
                form.action = '/home';
            }

            // Add a hidden input for the token
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'token';
            tokenInput.value = data.token;
            form.appendChild(tokenInput);

            // Add the form to the body and submit it
            document.body.appendChild(form);
            form.submit();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'An error occurred during login';
        errorDiv.style.display = 'block';
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                alert('Error logging out. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    if (!validatePassword()) {
        document.getElementById('general-error').textContent = 'Passwords must match';
        document.getElementById('general-error').style.display = 'block';
        return;
    }

    const form = event.target;
    const formData = {
        email: form.email.value,
        username: form.username.value,
        password: form.password.value,
        role: form.role.value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = '/login';
        } else {
            document.getElementById('general-error').textContent = data.message;
            document.getElementById('general-error').style.display = 'block';
        }
    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('general-error').textContent = 'An error occurred during registration';
        document.getElementById('general-error').style.display = 'block';
    }
} 