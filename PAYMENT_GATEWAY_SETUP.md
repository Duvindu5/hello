# Payment Gateway Integration Guide (Stripe)

This document guides you through completing the Stripe payment gateway integration for the LoftStay hotel booking website.

## What's Been Implemented

✅ **Frontend Integration:**
- Stripe.js library loaded
- Card element UI for payment collection
- Price calculation (dynamically calculates total based on room type and dates)
- Payment form with proper error handling
- Visual feedback for payment processing

## What You Need to Do

### Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account or log in
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Update Frontend API Key

In `script.js`, replace the placeholder with your actual Publishable Key:

```javascript
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY'); // Replace with your key
```

Example:
```javascript
const stripe = Stripe('pk_test_4eC39HqLyjWDarhtT657iD81');
```

### Step 3: Set Up Backend Server

You need a backend server to handle payment intent creation. Here's a Node.js/Express example:

#### Install dependencies:
```bash
npm install express stripe body-parser cors
```

#### Create `server.js`:
```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Replace with your secret key
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, email, name, checkIn, checkOut, roomType } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in cents
            currency: 'usd',
            description: `Hotel booking: ${roomType} from ${checkIn} to ${checkOut}`,
            receipt_email: email,
            metadata: {
                guest_name: name,
                check_in: checkIn,
                check_out: checkOut,
                room_type: roomType
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### Run the server:
```bash
node server.js
```

### Step 4: Update Frontend API Endpoint

If your backend is running on a different URL, update the fetch URL in `script.js`:

```javascript
// Current (local development):
const response = await fetch('/create-payment-intent', {

// For external server, use full URL:
const response = await fetch('https://your-server.com/create-payment-intent', {
```

### Step 5: Test the Integration

1. Start your backend server
2. Open the hotel booking website
3. Fill in the booking form
4. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Any future expiry date (e.g., 12/25)
   - Any 3-digit CVC

### Step 6: Go Live (Production)

1. Complete Stripe account verification
2. Switch to **Live API Keys** in Stripe Dashboard
3. Replace `pk_test_` with `pk_live_` in your JavaScript
4. Replace `sk_test_` with `sk_live_` in your backend
5. Deploy your backend server
6. Update frontend endpoint URLs if necessary

## Features Included

✅ Dynamic price calculation based on:
- Room type selected
- Check-in to check-out duration

✅ Real-time payment form validation

✅ Error handling and user feedback

✅ Success confirmation with booking details

✅ Responsive payment form styling

## Security Notes

⚠️ **Never commit your secret key to git**
- Use environment variables (`.env` file)
- Example: `STRIPE_SECRET_KEY=sk_test_xxx`

⚠️ **Always use HTTPS in production**

⚠️ **Backend handles sensitive operations**
- Payment intent creation
- Webhook handling (for advanced setups)

## Troubleshooting

**"Payment failed" error:**
- Check if backend server is running
- Verify API keys are correct
- Check browser console for error messages

**Stripe script not loading:**
- Verify internet connection
- Check if Stripe CDN is accessible

**CORS errors:**
- Ensure backend has CORS enabled
- Verify fetch URL matches your backend domain

## Next Steps

1. ✅ Integrate Stripe keys
2. ✅ Set up backend server
3. ✅ Test with test cards
4. Consider adding:
   - Webhook handlers for payment events
   - Email notifications
   - Booking confirmation database
   - Refund handling
   - Payment history for users

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Card Payment Integration](https://stripe.com/docs/payments/accept-a-payment)
- [Node.js Stripe Library](https://github.com/stripe/stripe-node)
