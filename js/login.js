document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");
    
    const form = document.getElementById("loginForm");
    console.log("Form element:", form);
    
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        console.log("Form submitted");
        event.preventDefault();

        const phoneNumber = document.getElementById("phoneNumber").value.trim();

        if (phoneNumber === "" || !/^\d{10}$/.test(phoneNumber)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid 10-digit phone number.',
                confirmButtonColor: '#007bff'
            });
            return;
        }

        // Show loading state
        Swal.fire({
            title: 'Logging in...',
            text: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        const requestData = { 
            phone: phoneNumber 
        };
        console.log('Sending data:', requestData);

        try {
            const response = await fetch("http://localhost:5008/api/users/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userName', data.user.name);
                    
                    // Check if user is admin
                    if (data.user.role === 'admin') {
                        localStorage.setItem('adminToken', data.token);
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        await Swal.fire({
                            icon: 'success',
                            title: `Welcome back, ${data.user.name}!`,
                            text: 'Login successful.',
                            confirmButtonColor: '#007bff'
                        });
                        
                        setTimeout(() => {
                            window.location.href = 'INDEX.html';
                        }, 100);
                    }
                }
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message || 'Invalid phone number. Please try again.',
                confirmButtonColor: '#007bff'
            });
        }
    });
});