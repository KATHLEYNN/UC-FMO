let currentDate = new Date();
let selectedDate = null;
let reservedDates = {};
document.addEventListener('DOMContentLoaded', function() {
    initializeRulesSection();
    initializeCalendar();
    loadReservedDates();
});

function initializeRulesSection() {
    const acceptCheckbox = document.getElementById('accept-rules');
    const acceptBtn = document.getElementById('accept-btn');
    
    if (acceptCheckbox && acceptBtn) {
        acceptCheckbox.addEventListener('change', function() {
            acceptBtn.disabled = !this.checked;
        });
    }
}

function acceptRules() {
    const rulesSection = document.getElementById('rules-section');
    const calendarSection = document.getElementById('calendar-section');
    
    if (rulesSection && calendarSection) {
        rulesSection.style.display = 'none';
        calendarSection.style.display = 'block';
        renderCalendar();
    }
}

function declineRules() {
    if (confirm('Are you sure you want to decline? You will be redirected to the home page.')) {
        window.location.href = '/home.html';
    }
}

function initializeCalendar() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

function renderCalendar() {
    const monthYearElement = document.getElementById('current-month-year');
    const calendarGrid = document.querySelector('.calendar-grid');
    
    if (!monthYearElement || !calendarGrid) return;
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    monthYearElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const dayHeaders = calendarGrid.querySelectorAll('.day-header');
    calendarGrid.innerHTML = '';
    dayHeaders.forEach(header => calendarGrid.appendChild(header));

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    for (let i = 0; i < startDate; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'disabled');
        calendarGrid.appendChild(emptyCell);
    }

    const today = new Date();
    const todayStr = formatDate(today);

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;

        const currentDateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        if (currentDateStr === todayStr) {
            dayElement.classList.add('today');
        }

        if (dayDate < today && currentDateStr !== todayStr) {
            dayElement.classList.add('disabled');
        }
        if (reservedDates[currentDateStr]) {
            dayElement.classList.add('reserved');
            dayElement.style.cursor = 'not-allowed';

            const event = reservedDates[currentDateStr];
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;

            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-title';
            eventTitle.textContent = truncateText(event.title, 20);
            eventTitle.title = event.title;

            const eventLocation = document.createElement('div');
            eventLocation.className = 'event-location';
            eventLocation.textContent = truncateText(event.location || 'TBD', 25);
            eventLocation.title = event.location || 'TBD';

            dayElement.textContent = '';
            dayElement.appendChild(dayNumber);
            dayElement.appendChild(eventTitle);
            dayElement.appendChild(eventLocation);
        }

        if (selectedDate && currentDateStr === selectedDate) {
            dayElement.classList.add('selected');
        }

        if (!dayElement.classList.contains('disabled') && !dayElement.classList.contains('reserved')) {
            dayElement.addEventListener('click', () => selectDate(currentDateStr, dayElement));
            dayElement.style.cursor = 'pointer';
        } else if (dayElement.classList.contains('reserved')) {
            dayElement.addEventListener('click', () => {
                const event = reservedDates[currentDateStr];
                const locationText = event.location ? `\nLocation: ${event.location}` : '';
                const timeText = event.time ? `\nTime: ${event.time}` : '';
                alert(`This date is already reserved!\n\nEvent: ${event.title}${timeText}${locationText}\n\nPlease select a different date.`);
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(dateStr, dayElement) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });

    dayElement.classList.add('selected');
    selectedDate = dateStr;
    const selectedDateInfo = document.getElementById('selected-date-info');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const continueBtn = document.getElementById('continue-btn');
    
    if (selectedDateInfo && selectedDateDisplay && continueBtn) {
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        selectedDateDisplay.textContent = formattedDate;
        selectedDateInfo.style.display = 'block';
        continueBtn.disabled = false;
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

async function loadReservedDates() {
    try {
        const response = await fetch('/api/reservations/calendar');
        if (response.ok) {
            const data = await response.json();
            reservedDates = data.reservedDates || {};
            renderCalendar();
        }
    } catch (error) {
        console.error('Error loading reserved dates:', error);
        loadMockReservedDates();
    }
}
function loadMockReservedDates() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 15);
    
    reservedDates = {
        [formatDate(nextWeek)]: {
            title: 'Faculty Meeting',
            time: '10:00 AM - 12:00 PM',
            location: 'Conference Room'
        },
        [formatDate(nextMonth)]: {
            title: 'Student Orientation',
            time: '1:00 PM - 4:00 PM',
            location: 'Auditorium'
        }
    };
    
    renderCalendar();
}

function goBackToRules() {
    const rulesSection = document.getElementById('rules-section');
    const calendarSection = document.getElementById('calendar-section');

    if (rulesSection && calendarSection) {
        calendarSection.style.display = 'none';
        rulesSection.style.display = 'block';

        const acceptCheckbox = document.getElementById('accept-rules');
        const acceptBtn = document.getElementById('accept-btn');
        if (acceptCheckbox && acceptBtn) {
            acceptCheckbox.checked = false;
            acceptBtn.disabled = true;
        }
    }
}

function proceedToForms() {
    if (!selectedDate) {
        alert('Please select a date first.');
        return;
    }

    localStorage.setItem('selectedReservationDate', selectedDate);

    const calendarSection = document.getElementById('calendar-section');
    const formSelection = document.getElementById('form-selection');

    if (calendarSection && formSelection) {
        calendarSection.style.display = 'none';
        formSelection.style.display = 'block';
    }
}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function navigateToForm(formUrl) {
    if (!selectedDate) {
        alert('Please select a date first.');
        return;
    }

    localStorage.setItem('selectedReservationDate', selectedDate);
    localStorage.setItem('selectedFormType', formUrl.replace('.html', ''));

    window.location.href = formUrl;
}

if (!checkAuthentication()) {
}
