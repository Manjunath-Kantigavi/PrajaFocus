import config from '../src/config/config.js';

document.addEventListener('DOMContentLoaded', function () {
    const isHomePage = window.location.pathname.toLowerCase().includes('index.html');
    const container = document.getElementById('govtBenefitsContainer');
    const token = localStorage.getItem('userToken');
    const language = localStorage.getItem('selectedLanguage') || 'en';

    // Move translations outside the displayBenefits function
    const translations = {
        'kn': {
            department: 'ಇಲಾಖೆ',
            eligibility: 'ಅರ್ಹತೆ',
            applyNow: 'ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
            subscribeTitle: 'ಹೆಚ್ಚಿನ ಪ್ರಯೋಜನಗಳಿಗಾಗಿ ಚಂದಾದಾರರಾಗಿ',
            subscribeText: 'ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಚಂದಾದಾರರಾಗಿ!',
            subscribeButton: 'ಈಗ ಚಂದಾದಾರರಾಗಿ',
            laterButton: 'ನಂತರ',
            freeAccess: 'ಉಚಿತ ಪ್ರವೇಶ',
            na: 'ಲಭ್ಯವಿಲ್ಲ',
            loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            error: 'ದೋಷ ಉಂಟಾಗಿದೆ',
            noSchemes: 'ಯೋಜನೆಗಳು ಲಭ್ಯವಿಲ್ಲ',
            moreDetails: 'ಹೆಚ್ಚಿನ ವಿವರಗಳು'
        },
        'hi': {
            department: 'विभाग',
            eligibility: 'योग्यता',
            applyNow: 'अभी आवेदन करें',
            subscribeTitle: 'अधिक लाभों के लिए सदस्यता लें',
            subscribeText: 'सभी सरकारी योजनाओं को देखने के लिए सदस्यता लें!',
            subscribeButton: 'अभी सदस्यता लें',
            laterButton: 'बाद में',
            freeAccess: 'नि:शुल्क एक्सेस',
            na: 'उपलब्ध नहीं',
            loading: 'लोड हो रहा है...',
            error: 'त्रुटि हुई',
            noSchemes: 'कोई योजना उपलब्ध नहीं',
            moreDetails: 'अधिक जानकारी'
        },
        'en': {
            department: 'Department',
            eligibility: 'Eligibility',
            applyNow: 'Apply Now',
            subscribeTitle: 'Subscribe for More Benefits',
            subscribeText: 'Subscribe to view all government schemes!',
            subscribeButton: 'Subscribe Now',
            laterButton: 'Later',
            freeAccess: 'Free Access',
            na: 'Not Available',
            loading: 'Loading...',
            error: 'Error occurred',
            noSchemes: 'No schemes available',
            moreDetails: 'More Details'
        }
    };

    const t = translations[language] || translations['en'];  // Define t at the top level

    async function loadGovtBenefits() {
        if (!container) return;
        container.innerHTML = `<p class="text-center">${t.loading}</p>`;
        try {
            const response = await fetch(`${config.API_URL}/govtbenefits`, {
                headers: {
                    ...(isHomePage ? {} : { 'Authorization': `Bearer ${token}` }),
                    'Accept-Language': language
                }
            });

            if (!response.ok && !isHomePage) {
                throw new Error('Failed to fetch benefits');
            }

            const benefits = await response.json();
            displayBenefits(benefits.slice(0, 3));
        } catch (error) {
            console.error('Error:', error);
            if (!isHomePage) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Please login to view all benefits',
                    confirmButtonColor: '#007bff'
                }).then(() => {
                    if (!token) {
                        window.location.href = `${language}login.html`;
                    }
                });
            }
        }
    }

    function displayBenefits(benefits) {
        if (!container) return;

        // Remove translations definition from here
        container.innerHTML = benefits.map(benefit => `
            <div class="scheme-card mb-3">
                <h5 class="mb-2">${benefit.title || t.na}</h5>
                <div class="badge bg-info mb-2">${t.department}: ${benefit.department || t.na}</div>
                <p class="mb-2">${benefit.description || t.na}</p>
                <div class="mb-2">
                    <strong>${t.eligibility}:</strong>
                    <p class="mb-2">${benefit.eligibility || t.na}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <a href="${benefit.applicationLink || '#'}" class="btn btn-sm btn-primary" 
                       ${benefit.applicationLink ? 'target="_blank"' : 'onclick="return false;"'}>
                        ${t.moreDetails}
                    </a>
                    ${benefit.subscriptionRequired ?
                `<span class="badge bg-warning text-dark">${t.subscriptionRequired}</span>` :
                `<span class="badge bg-success">${t.freeAccess}</span>`}
                </div>
            </div>
        `).join('');
        // Updated subscription alert logic to match jobs.js
    if (benefits.length === 3 && !localStorage.getItem('isSubscribed')) {
        Swal.fire({
            icon: 'info',
            title: translations[language].subscribeTitle,
            text: translations[language].subscribeText,
            confirmButtonColor: '#007bff',
            showCancelButton: true,
            confirmButtonText: translations[language].subscribeButton,
            cancelButtonText: translations[language].laterButton
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'subscription.html';
            }
        });
    }
    }

    // Make loadGovtBenefits available globally
    window.loadGovtBenefits = loadGovtBenefits;

    // Only auto-load if we're not on the schemes page
    if (!window.location.pathname.toLowerCase().includes('govt sc.html')) {
        loadGovtBenefits();
    }
});