// Stripe Integration
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY'); // Replace with your actual Stripe publishable key
const elements = stripe.elements();
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#111827',
            fontFamily: 'Inter, sans-serif'
        },
        invalid: {
            color: '#b91c1c'
        }
    }
});

let stripeReady = false;

if (document.getElementById('card-element')) {
    cardElement.mount('#card-element');
    stripeReady = true;
}

cardElement.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Room prices
const roomPrices = {
    '99': 99,
    '179': 179,
    '219': 219
};

// Calculate total price
function calculateTotal() {
    const checkIn = new Date(document.querySelector('input[name="checkin"]').value);
    const checkOut = new Date(document.querySelector('input[name="checkout"]').value);
    const roomType = document.getElementById('roomType').value;
    
    if (checkIn && checkOut && roomType) {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const pricePerNight = roomPrices[roomType];
        const total = nights > 0 ? nights * pricePerNight : 0;
        document.getElementById('totalPrice').textContent = `$${total}`;
        return total;
    }
    document.getElementById('totalPrice').textContent = '$0';
    return 0;
}

// Update total when dates or room type changes
document.querySelectorAll('input[name="checkin"], input[name="checkout"], select[name="roomType"]').forEach(element => {
    element.addEventListener('change', () => {
        const total = calculateTotal();
        document.getElementById('payment-section').style.display = total > 0 ? 'block' : 'none';
    });
});

// Handle form submission
const bookingForm = document.getElementById('bookingForm');
const bookingFeedback = document.getElementById('bookingFeedback');

bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = bookingForm.name.value.trim();
    const email = bookingForm.email.value.trim();
    const checkIn = bookingForm.checkin.value;
    const checkOut = bookingForm.checkout.value;
    const roomType = bookingForm.roomType.value;
    const total = calculateTotal();

    if (!name || !email || !checkIn || !checkOut || total <= 0) {
        bookingFeedback.textContent = 'Please complete all booking details.';
        bookingFeedback.style.color = '#b91c1c';
        return;
    }

    // Show loading state
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing payment...';

    try {
        // Create payment intent on your server
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total * 100, // Amount in cents
                email: email,
                name: name,
                checkIn: checkIn,
                checkOut: checkOut,
                roomType: roomType
            })
        });

        const paymentData = await response.json();

        if (!response.ok) {
            throw new Error(paymentData.error || 'Payment processing failed');
        }

        // Confirm payment with Stripe
        const { paymentIntent, error } = await stripe.confirmCardPayment(paymentData.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: name, email: email }
            }
        });

        if (error) {
            bookingFeedback.textContent = `Payment failed: ${error.message}`;
            bookingFeedback.style.color = '#b91c1c';
        } else if (paymentIntent.status === 'succeeded') {
            bookingFeedback.textContent = `✓ Payment successful! Thanks ${name}, your stay from ${checkIn} to ${checkOut} is confirmed. A confirmation email will be sent to ${email}.`;
            bookingFeedback.style.color = '#047857';
            bookingForm.reset();
            document.getElementById('payment-section').style.display = 'none';
            document.getElementById('totalPrice').textContent = '$0';
        }
    } catch (err) {
        bookingFeedback.textContent = `Error: ${err.message}`;
        bookingFeedback.style.color = '#b91c1c';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});
