const axios = require('axios');
const config = require('../config/config');

const DECENTRO_BASE_URL = 'https://in.staging.decentro.tech/v2';
const CLIENT_ID = 'Dreambookpublishing_1_sop';
const CLIENT_SECRET = '4cbcc057c6b640d2837892b0280e47be';
const MODULE_SECRET = '5bcddb84dcdd4a40a0b4f7859ec101a0';
const PROVIDER_SECRET = 'fa6dd5dfb8ca4e66960d6cde39b244a2';

// Generate JWT token
async function generateToken() {
  try {
    const response = await axios.post(`${DECENTRO_BASE_URL}/auth/token`, {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });

    return response.data.token;
  } catch (error) {
    console.error('Error generating Decentro token:', error);
    throw error;
  }
}

// Create payment order
async function createPaymentOrder(orderData) {
  try {
    const token = await generateToken();
    
    const payload = {
      amount: orderData.amount,
      payment_mode: "UPI",
      reference_id: orderData.orderId,
      bank_account: {
        account_number: "your_account_number",
        ifsc: "your_ifsc"
      },
      upi_id: orderData.upiId || "test@upi",
      purpose: "Book Purchase",
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    };

    const response = await axios.post(`${DECENTRO_BASE_URL}/payments/upi/link`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'client_id': CLIENT_ID,
        'module_secret': MODULE_SECRET,
        'provider_secret': PROVIDER_SECRET
      }
    });

    return {
      paymentId: response.data.payment_id,
      paymentLink: response.data.upi_link,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error creating Decentro payment:', error);
    throw error;
  }
}

// Verify payment status
async function verifyPayment(paymentId) {
  try {
    const token = await generateToken();
    
    const response = await axios.get(`${DECENTRO_BASE_URL}/payments/${paymentId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'client_id': CLIENT_ID,
        'module_secret': MODULE_SECRET
      }
    });

    return {
      status: response.data.status,
      transactionId: response.data.transaction_id,
      paymentDetails: response.data.payment_details
    };
  } catch (error) {
    console.error('Error verifying Decentro payment:', error);
    throw error;
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment
};