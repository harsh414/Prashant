// ===============================
// Venue favorite (unchanged)
// ===============================
function toggleFavorite(button) {
    button.classList.toggle('favorited');

    const venueCard = button.closest('.venue__card');
    venueCard.classList.add('heart-animation');

    setTimeout(() => {
        venueCard.classList.remove('heart-animation');
    }, 600);
}

// ===============================
// Countdown Timer (unchanged)
// ===============================
function updateCountdown() {
    const weddingDate = new Date('2026-11-21T12:00:00');
    const now = new Date();
    const diff = weddingDate.getTime() - now.getTime();

    if (diff <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ===============================
// Guest stepper logic (unchanged)
// ===============================
function incrementGuests() {
    const input = document.getElementById('guest-count');
    const value = parseInt(input.value) || 0;

    if (value < 10) {
        input.value = value + 1;
        if (value === 0) {
            document.querySelector('input[name="attendance"][value="Yes"]').checked = true;
        }
        updateStepperButtons();
    }
}

function decrementGuests() {
    const input = document.getElementById('guest-count');
    const value = parseInt(input.value) || 0;

    if (value > 0) {
        input.value = value - 1;
        if (input.value == 0) {
            document.querySelector('input[name="attendance"][value="No"]').checked = true;
        }
        updateStepperButtons();
    }
}

function updateStepperButtons() {
    const input = document.getElementById('guest-count');
    const value = parseInt(input.value) || 0;
    const buttons = document.querySelectorAll('.number-btn');

    if (!buttons.length) return;

    buttons[0].disabled = value <= 0;
    buttons[1].disabled = value >= 10;
}

// ===============================
// Attendance ↔ guest sync
// ===============================
function handleAttendanceChange() {
    const guestInput = document.getElementById('guest-count');
    const yes = document.querySelector('input[name="attendance"][value="Yes"]');
    const no = document.querySelector('input[name="attendance"][value="No"]');

    if (yes.checked) {
        guestInput.disabled = false;
        guestInput.value = 1;
        guestInput.placeholder = '';
    }

    if (no.checked) {
        guestInput.value = 0;
        guestInput.disabled = true;
        guestInput.placeholder = '';
    }

    updateStepperButtons();
}


// ===============================
// Validation (unchanged)
// ===============================
function validateForm() {
    const name = document.getElementById('guest-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked');

    if (!name || !attendance) {
        alert('Please fill all required fields.');
        return false;
    }
    return true;
}

// ===============================
// Clear form (unchanged)
// ===============================
function clearForm() {
    document.getElementById('rsvp-form').reset();
    const guestCount = document.getElementById('guest-count');
    guestCount.value = '';
    guestCount.placeholder = 'Let us know the party size';
    updateStepperButtons();
}

// ===============================
// LOCAL STORAGE SAVE (NEW)
// ===============================
function saveRsvpLocally(data) {
    fetch("https://script.google.com/macros/s/AKfycby22IaRmRXyqRTfK6fvUOApXw3MfFfeqELcqSTXvpQ-Qq2lK8vBIOlm7aYcUbkGri60/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...data,
            source: "wedding-site"
        })
    });

    // We assume success if the request was sent
    alert("Thank you! Your RSVP has been recorded.");
    clearForm();
}


// ===============================
// Init
// ===============================
document.addEventListener('DOMContentLoaded', function () {

    // Countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Attendance change handlers
    const yes = document.querySelector('input[name="attendance"][value="Yes"]');
    const no = document.querySelector('input[name="attendance"][value="No"]');
    if (yes) yes.addEventListener('change', handleAttendanceChange);
    if (no) no.addEventListener('change', handleAttendanceChange);

    updateStepperButtons();

    // Form submit (CLEANED)
    const form = document.getElementById('rsvp-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const payload = {
            name: document.getElementById('guest-name').value.trim(),
            attending: document.querySelector('input[name="attendance"]:checked').value,
            guests: parseInt(document.getElementById('guest-count').value || 0),
            specialRequest: document.getElementById('special-requests').value.trim(),
            submittedAt: new Date().toISOString()
        };

        saveRsvpLocally(payload);

        alert('Thank you! Your RSVP has been saved.');

        clearForm();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';

        console.log('Saved RSVP:', payload);
        console.log('All RSVPs:', JSON.parse(localStorage.getItem('rsvpResponses')));
    });
});
