document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");
    
    const form = document.getElementById("signupForm");
    console.log("Form element:", form);
    
    document.getElementById("signupForm").addEventListener("submit", async function (event) {
        console.log("Form submitted");
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const phoneNumber = document.getElementById("phoneNumber").value.trim();

        if (fullName === "" || phoneNumber === "" || !/^\d{10}$/.test(phoneNumber)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid name and a 10-digit phone number.',
                confirmButtonColor: '#28a745'
            });
            return;
        }

        // Show loading state
        Swal.fire({
            title: 'Signing up...',
            text: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        const requestData = { 
            name: fullName,
            phone: phoneNumber 
        };
        console.log('Sending data:', requestData);

        try {
            const response = await fetch("http://localhost:5008/api/users/register", {
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
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your account has been created successfully.',
                    confirmButtonColor: '#28a745'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'enlogin.html';
                    }
                });
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message || 'Something went wrong!',
                confirmButtonColor: '#28a745'
            });
        }
    });
});
