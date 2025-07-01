const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm_password');
const matchRequirement = document.getElementById('match');

function validatePassword() {
    const pass = password.value;
    const confirm = confirmPassword.value;

    matchRequirement.classList.toggle('valid', pass === confirm && pass !== '');

    return pass === confirm && pass !== '';
}

document.addEventListener('DOMContentLoaded', function() {
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', handleSignup);
    }
}); 