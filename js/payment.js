document.addEventListener('DOMContentLoaded', function() {
    // Get selected plan from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan');
    
    if (selectedPlan) {
        // Highlight the selected plan
        const planButtons = document.querySelectorAll('.pricing-card button');
        planButtons.forEach(button => {
            if (button.getAttribute('onclick').includes(selectedPlan)) {
                button.classList.add('active');
                button.innerHTML = 'Selected Plan';
                // Scroll to the selected plan
                button.closest('.pricing-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});

async function handleSubscription(planType) {
    const plans = {
        'monthly': { amount: 30, duration: '1 Month' },
        'halfYearly': { amount: 162, duration: '6 Months' },
        'yearly': { amount: 288, duration: '1 Year' }
    };

    const token = localStorage.getItem('userToken');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please login to subscribe to a plan',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'enlogin.html';
            }
        });
        return;
    }

    const selectedPlan = plans[planType];
    
    try {
        // First, create order from our backend
        const orderResponse = await fetch('http://localhost:5008/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                planType: planType,
                amount: selectedPlan.amount,
                duration: selectedPlan.duration
            })
        });

        if (!orderResponse.ok) {
            const errorData = await orderResponse.json();
            throw new Error(errorData.message || 'Failed to create order');
        }

        const orderData = await orderResponse.json();

        const options = {
            key: orderData.key_id, // Key will come from backend
            amount: orderData.amount,
            currency: orderData.currency,
            order_id: orderData.order_id,
            name: 'Praja Focus',
            description: `${selectedPlan.duration} Subscription`,
            image: 'WhatsApp_Image_2025-03-01_at_13.15.09_17987284-removebg-preview.png',
            prefill: {
                email: localStorage.getItem('userEmail') || '',
                contact: localStorage.getItem('userPhone') || ''
            },
            theme: {
                color: '#007bff'
            },
            handler: async function(response) {
                try {
                    const verifyResponse = await fetch('http://localhost:5008/api/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            planType: planType,
                            duration: selectedPlan.duration,
                            amount: selectedPlan.amount
                        })
                    });

                    if (verifyResponse.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Subscription Successful!',
                            text: 'You now have access to all premium features'
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        throw new Error('Payment verification failed');
                    }
                } catch (error) {
                    console.error('Payment verification failed:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to verify payment. Please contact support.'
                    });
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: 'The payment was not completed. Please try again.'
            });
        });
        rzp.open();
    } catch (error) {
        console.error('Payment initialization failed:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to initialize payment. Please try again.'
        });
    }
}