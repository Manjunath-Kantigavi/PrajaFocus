document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.querySelector('.login-btn');
    const signupButton = document.querySelector('.signup-btn');
    const userSection = document.querySelector('.col-md-3.text-end');
    
    function checkAuthState() {
        const token = localStorage.getItem('userToken');
        const userName = localStorage.getItem('userName');
        
        if (token && userName) {
            // User is logged in
            userSection.innerHTML = `
                <span class="me-2" style="color: #007bff;">Welcome, ${userName}</span>
                <button type="button" class="btn btn-outline-danger" onclick="handleLogout()">Logout</button>
            `;
        } else {
            // User is not logged in
            userSection.innerHTML = `
                <a href="enlogin.html" style="text-decoration: none;">
                    <button type="button" class="btn btn-outline-primary me-2">Login</button>
                </a>
                <a href="signup.html" style="text-decoration: none;">
                    <button type="button" class="btn btn-outline-primary">Signup</button>
                </a>
            `;
        }
    }

    function handleLogout() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userName');
                window.location.reload();
            }
        });
    }

    window.handleLogout = handleLogout;
    checkAuthState();
});