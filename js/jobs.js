import config from '../src/config/config.js';

document.addEventListener('DOMContentLoaded', function() {
    const jobsList = document.getElementById('jobsList');
    const token = localStorage.getItem('userToken');
    const language = localStorage.getItem('selectedLanguage') || 'en';

    const translations = {
        en: {
            noJobs: 'No job updates available yet.',
            description: 'Description',
            eligibility: 'Eligibility',
            applyNow: 'Apply Now',
            loginRequired: 'Please login to view jobs',
            error: 'Error',
            subscribeTitle: 'Subscribe for More',
            subscribeText: 'Subscribe to view all job updates!'
        },
        kn: {
            noJobs: 'ಯಾವುದೇ ಉದ್ಯೋಗ ನವೀಕರಣಗಳು ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.',
            description: 'ವಿವರಣೆ',
            eligibility: 'ಅರ್ಹತೆ',
            applyNow: 'ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
            loginRequired: 'ಉದ್ಯೋಗಗಳನ್ನು ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ',
            error: 'ದೋಷ',
            subscribeTitle: 'ಹೆಚ್ಚಿನದಕ್ಕಾಗಿ ಚಂದಾದಾರರಾಗಿ',
            subscribeText: 'ಎಲ್ಲಾ ಉದ್ಯೋಗ ನವೀಕರಣಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಚಂದಾದಾರರಾಗಿ!'
        },
        hi: {
            noJobs: 'अभी तक कोई नौकरी अपडेट उपलब्ध नहीं है।',
            description: 'विवरण',
            eligibility: 'योग्यता',
            applyNow: 'अभी आवेदन करें',
            loginRequired: 'नौकरियां देखने के लिए कृपया लॉगिन करें',
            error: 'त्रुटि',
            subscribeTitle: 'और देखने के लिए सब्सक्राइब करें',
            subscribeText: 'सभी नौकरी अपडेट देखने के लिए सब्सक्राइब करें!'
        }
    };

    async function fetchJobs() {
        try {
            const response = await fetch(`${config.API_URL}/jobschemes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': language
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const jobs = await response.json();
            displayJobs(jobs);
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

    function displayJobs(jobs) {
        if (!jobs.length) {
            jobsList.innerHTML = `<p class="text-muted">${translations[language].noJobs}</p>`;
            return;
        }

        jobsList.innerHTML = jobs.map(job => `
            <div class="job-card mb-3">
                <h5 class="mb-1">${job.title}</h5>
                <p class="mb-1"><strong>${translations[language].description}:</strong> ${job.description}</p>
                <p class="mb-1"><strong>${translations[language].eligibility}:</strong> ${job.eligibility}</p>
                <a href="${job.applicationLink}" class="btn btn-sm btn-primary" target="_blank">${translations[language].applyNow}</a>
            </div>
        `).join('');

        if (jobs.length === 1) {
            Swal.fire({
                icon: 'info',
                title: translations[language].subscribeTitle,
                text: translations[language].subscribeText,
                confirmButtonColor: '#007bff'
            });
        }
    }

    fetchJobs();
});