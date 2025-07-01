document.addEventListener('DOMContentLoaded', async function() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Token verification failed: ${data.message}`);
        }

        if (!data.user || data.user.role !== 'admin') {
            if (data.user && (data.user.role === 'student' || data.user.role === 'external')) {
                window.location.href = '/home';
            } else {
                window.location.href = '/login';
            }
            return;
        }

        document.body.style.display = 'block';
        await initializeCharts();
        await updateDashboardStats();
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
});

async function initializeCharts() {
    try {
        const cultureCtx = document.getElementById('cultureChart').getContext('2d');
        new Chart(cultureCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reservations by Type',
                    data: [],
                    backgroundColor: '#365486',
                    borderColor: '#365486',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const stylesCtx = document.getElementById('stylesChart').getContext('2d');
        new Chart(stylesCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#365486',
                        '#4a6ea5',
                        '#7895cb',
                        '#a5b8e0'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    } catch (error) {
    }
}

async function updateDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        const data = await response.json();

        const totalReservationsEl = document.getElementById('total-reservations');
        const topReservationTypeEl = document.getElementById('top-reservation-type');
        const totalClientsEl = document.getElementById('total-clients');

        if (totalReservationsEl) totalReservationsEl.textContent = data.totalReservations;
        if (topReservationTypeEl) topReservationTypeEl.textContent = data.topReservationType;
        if (totalClientsEl) totalClientsEl.textContent = data.totalClients;

        updateCharts(data);
    } catch (error) {
        // Dashboard stats update failed - continue with default values
    }
}

function updateCharts(data) {
    // Charts update implementation
}