const bookingForm = document.getElementById('bookingForm');
const bookingFeedback = document.getElementById('bookingFeedback');

bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = bookingForm.name.value.trim();
    const checkIn = bookingForm.checkin.value;
    const checkOut = bookingForm.checkout.value;

    if (!name || !checkIn || !checkOut) {
        bookingFeedback.textContent = 'Please complete all booking details.';
        bookingFeedback.style.color = '#b91c1c';
        return;
    }

    bookingFeedback.textContent = `Thanks ${name}, your stay is being prepared. A confirmation email will be sent shortly.`;
    bookingFeedback.style.color = '#047857';
    bookingForm.reset();
});
