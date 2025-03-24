document.addEventListener('DOMContentLoaded', function() {
    const subsidiesList = document.getElementById('subsidyList');
    const token = localStorage.getItem('userToken');
    const language = localStorage.getItem('selectedLanguage') || 'en';

    const translations = {
        en: {
            noSubsidies: 'No subsidy updates available yet.',
            loading: 'Loading...',
            department: 'Department',
            moreDetails: 'More Details',
            loginRequired: 'Please login to view subsidies',
            error: 'Error',
            subscribeTitle: 'Subscribe for More',
            subscribeText: 'Subscribe to view all subsidies!',
            agriculture: 'Ministry of Agriculture',
            fertilizer: 'Financial support for farmers to buy fertilizers and seeds'
        },
        hi: {
            noSubsidies: 'कोई सब्सिडी अपडेट उपलब्ध नहीं है।',
            loading: 'लोड हो रहा है...',
            department: 'विभाग',
            moreDetails: 'और जानकारी',
            loginRequired: 'सब्सिडी देखने के लिए लॉगिन करें',
            error: 'त्रुटि',
            subscribeTitle: 'और देखने के लिए सब्सक्राइब करें',
            subscribeText: 'सभी सब्सिडी अपडेट देखने के लिए सब्सक्राइब करें!'
        },
        kn: {
            noSubsidies: 'ಇದುವರೆಗೆ ಯಾವುದೇ ಅನುದಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
            loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            department: 'ಇಲಾಖೆ',
            moreDetails: 'ಮತ್ತಷ್ಟು ಮಾಹಿತಿ',
            loginRequired: 'ಅನುದಾನ ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ',
            error: 'ದೋಷ',
            subscribeTitle: 'ಹೆಚ್ಚಿನದಕ್ಕಾಗಿ ಚಂದಾದಾರರಾಗಿ',
            subscribeText: 'ಎಲ್ಲಾ ಅನುದಾನ ಮಾಹಿತಿ ನೋಡಲು ಚಂದಾದಾರರಾಗಿ!',
            agriculture: 'ಕೃಷಿ ಸಚಿವಾಲಯ',
            fertilizer: 'ರಸಗೊಬ್ಬರ ಮತ್ತು ಬೀಜಗಳನ್ನು ಖರೀದಿಸಲು ರೈತರಿಗೆ ಆರ್ಥಿಕ ನೆರವು'
        },
        hi: {
            noSubsidies: 'कोई सब्सिडी अपडेट उपलब्ध नहीं है।',
            loading: 'लोड हो रहा है...',
            department: 'विभाग',
            moreDetails: 'और जानकारी',
            loginRequired: 'सब्सिडी देखने के लिए लॉगिन करें',
            error: 'त्रुटि',
            subscribeTitle: 'और देखने के लिए सब्सक्राइब करें',
            subscribeText: 'सभी सब्सिडी अपडेट देखने के लिए सब्सक्राइब करें!'
        }
    };

    async function fetchSubsidies() {
        try {
            const response = await fetch('http://localhost:5008/api/subsidies', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': language
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subsidies');
            }

            const subsidies = await response.json();
            displaySubsidies(subsidies);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: translations[language].error,
                text: translations[language].loginRequired,
                confirmButtonColor: '#007bff'
            }).then(() => {
                if (!token) {
                    window.location.href = `${language}login.html`;
                }
            });
        }
    }

    function displaySubsidies(subsidies) {
        if (!subsidies.length) {
            subsidiesList.innerHTML = `<p class="text-muted">${translations[language].noSubsidies}</p>`;
            return;
        }

        subsidiesList.innerHTML = subsidies.map(subsidy => {
            // Translate department and description if they match known translations
            const translatedDepartment = translations[language][subsidy.department.toLowerCase()] || subsidy.department;
            const translatedDescription = translations[language][subsidy.description.toLowerCase()] || subsidy.description;

            return `
                <div class="subsidy-card mb-3">
                    <h5 class="mb-1">${subsidy.name}</h5>
                    <p class="mb-2"><strong>${translations[language].department}:</strong> ${translatedDepartment}</p>
                    <p class="mb-2">${translatedDescription}</p>
                    <div class="d-flex">
                        <a href="${subsidy.moreDetailsLink}" class="btn btn-sm btn-primary" target="_blank">${translations[language].moreDetails}</a>
                    </div>
                </div>
            `;
        }).join('');

        if (subsidies.length === 1) {
            Swal.fire({
                icon: 'info',
                title: translations[language].subscribeTitle,
                text: translations[language].subscribeText,
                confirmButtonColor: '#007bff'
            });
        }
    }

    fetchSubsidies();
});