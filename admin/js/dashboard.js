import config from '../../src/config/config.js';

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Load initial dashboard stats
    loadDashboardStats();

    // Navigation handling
    document.querySelectorAll('.nav_link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            loadContent(page);
            setActiveLink(this);
        });
    });

    // Logout handling
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = '../login.html';
    });

    // Mobile menu toggle
    const toggle = document.getElementById('header-toggle');
    const nav = document.getElementById('nav-bar');
    const bodypd = document.getElementById('body-pd');
    const headerpd = document.getElementById('header');

    toggle.addEventListener('click', () => {
        nav.classList.toggle('show');
        toggle.classList.toggle('bx-x');
        bodypd.classList.toggle('body-pd');
        headerpd.classList.toggle('body-pd');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && window.innerWidth <= 768) {
            nav.classList.remove('show');
            toggle.classList.remove('bx-x');
            bodypd.classList.remove('body-pd');
            headerpd.classList.remove('body-pd');
        }
    });
});

async function loadDashboardStats() {
    try {
        const response = await fetch(`${config.API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const stats = await response.json();
        displayDashboardStats(stats);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Failed to load dashboard statistics', 'error');
    }
}

function displayDashboardStats(stats) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <h2 class="mb-4">Dashboard Overview</h2>
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card bg-primary text-white h-100" style="cursor: pointer" onclick="loadContent('subscribers')">
                        <div class="card-body">
                            <h5 class="card-title">Total Subscribers</h5>
                            <h2 class="mb-0">${stats.totalSubscribers || 0}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card bg-success text-white h-100">
                        <div class="card-body">
                            <h5 class="card-title">Monthly Revenue</h5>
                            <h2 class="mb-0">₹${stats.monthlyRevenue || 0}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card bg-info text-white h-100">
                        <div class="card-body">
                            <h5 class="card-title">Active Jobs</h5>
                            <h2 class="mb-0">${stats.activeJobs || 0}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card bg-warning text-white h-100">
                        <div class="card-body">
                            <h5 class="card-title">Total Schemes</h5>
                            <h2 class="mb-0">${stats.totalSchemes || 0}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card bg-danger text-white h-100">
                        <div class="card-body">
                            <h5 class="card-title">Total Subsidies</h5>
                            <h2 class="mb-0">${stats.totalSubsidies || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Charts section -->
            <div class="row g-3">
                <div class="col-12 col-lg-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Revenue Trends</h5>
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Subscriber Growth</h5>
                            <canvas id="subscriberChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeCharts(stats);
}

function initializeCharts(stats) {
    // Revenue Chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels: stats.revenueData.labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: stats.revenueData.values,
                borderColor: '#0d6efd',
                tension: 0.1
            }]
        }
    });

    // Subscriber Chart
    new Chart(document.getElementById('subscriberChart'), {
        type: 'bar',
        data: {
            labels: stats.subscriberData.labels,
            datasets: [{
                label: 'New Subscribers',
                data: stats.subscriberData.values,
                backgroundColor: '#198754'
            }]
        }
    });
}


function loadContent(page) {
    switch(page) {
        case 'jobs':
            loadJobsManager();
            break;
        case 'schemes':
            loadSchemesManager();
            break;
        case 'subsidies':
            loadSubsidiesManager();
            break;
        case 'subscribers':
            loadSubscribersManager();
            break;
        case 'payments':
            loadPaymentsManager();
            break;
        default:
            loadDashboardStats();
    }
}

function setActiveLink(clickedLink) {
    document.querySelectorAll('.nav_link').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

// Jobs Manager
async function loadJobsManager() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                <h2 class="mb-3 mb-sm-0">Manage Job Updates</h2>
                <button class="btn btn-primary" onclick="openJobForm()">Add New Job</button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Eligibility</th>
                            <th>Posted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="jobsTableBody">
                        <tr>
                            <td colspan="5" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Job Form Modal -->
        <div class="modal fade" id="jobModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
                <div class="modal-content shadow-lg">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title w-100 text-center fw-bold" id="jobModalTitle">Add New Job</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body px-4 pt-2">
                        <form id="jobForm" class="needs-validation" novalidate>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Title</label>
                                <input type="text" class="form-control form-control-lg" id="jobTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Description</label>
                                <textarea class="form-control" id="jobDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Eligibility</label>
                                <textarea class="form-control" id="jobEligibility" rows="3" required></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="form-label small fw-bold text-muted">Application Link</label>
                                <input type="url" class="form-control" id="jobLink" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0 pt-0 justify-content-center">
                        <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary px-4" onclick="saveJob()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadJobs();
}

// Job Management Functions
async function loadJobs() {
    try {
        const response = await fetch(`${config.API_URL}/jobschemes?isAdmin=true`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load jobs');
        }
        
        const jobs = await response.json();
        console.log('Fetched jobs:', jobs);
        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        Swal.fire('Error', 'Failed to load jobs', 'error');
    }
}

function displayJobs(jobs) {
    const tbody = document.getElementById('jobsTableBody');
    console.log('Number of jobs to display:', jobs.length); // Debug log

    if (!jobs || jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No jobs available</td></tr>';
        return;
    }

    const jobRows = [];
    for (let job of jobs) {
        jobRows.push(`
            <tr>
                <td>${job.title || 'N/A'}</td>
                <td>${job.description ? job.description.substring(0, 100) + '...' : 'N/A'}</td>
                <td>${job.eligibility || 'N/A'}</td>
                <td>${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editJob('${job._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteJob('${job._id}')">Delete</button>
                </td>
            </tr>
        `);
    }
    tbody.innerHTML = jobRows.join('');
}

window.openJobForm = function openJobForm(jobData = null) {
    const modal = document.getElementById('jobModal');
    const form = document.getElementById('jobForm');
    const modalTitle = document.getElementById('jobModalTitle');

    // Reset form
    form.reset();
    form.dataset.jobId = '';

    // If editing existing job
    if (jobData) {
        modalTitle.textContent = 'Edit Job';
        form.dataset.jobId = jobData._id;
        document.getElementById('jobTitle').value = jobData.title;
        document.getElementById('jobDescription').value = jobData.description;
        document.getElementById('jobEligibility').value = jobData.eligibility;
        document.getElementById('jobLink').value = jobData.applicationLink;
    } else {
        modalTitle.textContent = 'Add New Job';
    }

    // Show modal
    new bootstrap.Modal(modal).show();
}

window.saveJob = async function () {
    const form = document.getElementById('jobForm');
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        eligibility: document.getElementById('jobEligibility').value,
        applicationLink: document.getElementById('jobLink').value
    };

    const jobId = form.dataset.jobId;
    const url = `${config.API_URL}/jobschemes${jobId ? `/${jobId}` : ''}`;
    const method = jobId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(jobData)
        });

        if (response.ok) {
            Swal.fire('Success', `Job ${jobId ? 'updated' : 'added'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('jobModal')).hide();
            loadJobs();
        } else {
            throw new Error('Failed to save job');
        }
    } catch (error) {
        console.error('Error saving job:', error);
        Swal.fire('Error', 'Failed to save job', 'error');
    }
}

window.deleteJob = async  function (jobId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${config.API_URL}/jobschemes/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                Swal.fire('Deleted!', 'Job has been deleted.', 'success');
                loadJobs();
            } else {
                throw new Error('Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            Swal.fire('Error', 'Failed to delete job', 'error');
        }
    }
}

// Schemes Manager
async function loadSchemesManager() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                <h2 class="mb-3 mb-sm-0">Manage Government Schemes</h2>
                <button class="btn btn-primary" onclick="openSchemeForm()">Add New Scheme</button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Description</th>
                            <th>Posted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="schemesTableBody">
                        <tr>
                            <td colspan="5" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Scheme Form Modal -->
        <div class="modal fade" id="schemeModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
                <div class="modal-content shadow-lg">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title w-100 text-center fw-bold" id="schemeModalTitle">Add New Scheme</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body px-4 pt-2">
                        <form id="schemeForm" class="needs-validation" novalidate>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Title</label>
                                <input type="text" class="form-control" id="schemeTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Department</label>
                                <input type="text" class="form-control" id="schemeDepartment" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Description</label>
                                <textarea class="form-control" id="schemeDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Eligibility</label>
                                <textarea class="form-control" id="schemeEligibility" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Application Link</label>
                                <input type="url" class="form-control" id="schemeLink" required>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="schemeSubscriptionRequired">
                                    <label class="form-check-label small fw-bold text-muted">Subscription Required</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0 pt-0 justify-content-center">
                        <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary px-4" onclick="saveScheme()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadSchemes();
}

function displaySchemes(schemes) {
    const tbody = document.getElementById('schemesTableBody');
    
    if (!schemes || schemes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No schemes available</td></tr>';
        return;
    }

    tbody.innerHTML = schemes.map(scheme => `
        <tr>
            <td>${scheme.title || 'N/A'}</td>
            <td>${scheme.department || 'N/A'}</td>
            <td>${scheme.description ? scheme.description.substring(0, 100) + '...' : 'N/A'}</td>
            <td>${scheme.createdAt ? new Date(scheme.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editScheme('${scheme._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteScheme('${scheme._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

window.openSchemeForm = function(schemeData = null) {
    const modal = new bootstrap.Modal(document.getElementById('schemeModal'));
    const form = document.getElementById('schemeForm');
    
    if (schemeData) {
        document.getElementById('schemeModalTitle').textContent = 'Edit Scheme';
        document.getElementById('schemeTitle').value = schemeData.title;
        document.getElementById('schemeDepartment').value = schemeData.department;
        document.getElementById('schemeDescription').value = schemeData.description;
        document.getElementById('schemeEligibility').value = schemeData.eligibility;
        document.getElementById('schemeLink').value = schemeData.applicationLink;
        document.getElementById('schemeSubscriptionRequired').checked = schemeData.subscriptionRequired;
        form.dataset.schemeId = schemeData._id;
    } else {
        document.getElementById('schemeModalTitle').textContent = 'Add New Scheme';
        form.reset();
        delete form.dataset.schemeId;
    }
    
    modal.show();
}

async function loadSchemes() {
    try {
        const response = await fetch(`${config.API_URL}/govtbenefits?isAdmin=true`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load schemes');
        }
        
        const schemes = await response.json();
        displaySchemes(schemes);
    } catch (error) {
        console.error('Error loading schemes:', error);
        Swal.fire('Error', 'Failed to load schemes', 'error');
    }
}

window.saveScheme = async function() {
    const form = document.getElementById('schemeForm');
    const schemeData = {
        title: document.getElementById('schemeTitle').value,
        department: document.getElementById('schemeDepartment').value,
        description: document.getElementById('schemeDescription').value,
        eligibility: document.getElementById('schemeEligibility').value,
        applicationLink: document.getElementById('schemeLink').value,
        subscriptionRequired: document.getElementById('schemeSubscriptionRequired').checked
    };

    const schemeId = form.dataset.schemeId;
    const url = `${config.API_URL}/govtbenefits${schemeId ? `/${schemeId}` : ''}`;
    const method = schemeId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(schemeData)
        });

        if (response.ok) {
            Swal.fire('Success', `Scheme ${schemeId ? 'updated' : 'added'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('schemeModal')).hide();
            loadSchemes();
        } else {
            throw new Error('Failed to save scheme');
        }
    } catch (error) {
        console.error('Error saving scheme:', error);
        Swal.fire('Error', 'Failed to save scheme', 'error');
    }
}

window.editScheme = async function (schemeId) {
    try {
        const response = await fetch(`${config.API_URL}/govtbenefits/${schemeId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch scheme details');
        }
        
        const schemeData = await response.json();
        openSchemeForm(schemeData);
    } catch (error) {
        console.error('Error fetching scheme details:', error);
        Swal.fire('Error', 'Failed to load scheme details', 'error');
    }
}
window.deleteScheme = async function(schemeId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${config.API_URL}/govtbenefits/${schemeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                Swal.fire('Deleted!', 'Scheme has been deleted.', 'success');
                loadSchemes();
            } else {
                throw new Error('Failed to delete scheme');
            }
        } catch (error) {
            console.error('Error deleting scheme:', error);
            Swal.fire('Error', 'Failed to delete scheme', 'error');
        }
    }
};


// Subsidies Manager
async function loadSubsidiesManager() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                <h2 class="mb-3 mb-sm-0">Manage Subsidies</h2>
                <button class="btn btn-primary" onclick="openSubsidyForm()">Add New Subsidy</button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th style="width: 20%">Name</th>
                            <th style="width: 20%">Department</th>
                            <th style="width: 30%">Description</th>
                            <th style="width: 15%">Posted Date</th>
                            <th style="width: 15%">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="subsidiesTableBody">
                        <tr>
                            <td colspan="5" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Subsidy Form Modal -->
        <div class="modal fade" id="subsidyModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow-lg">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title w-100 text-center fw-bold" id="subsidyModalTitle">Add New Subsidy</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body px-4 pt-2">
                        <form id="subsidyForm" class="needs-validation" novalidate>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Name</label>
                                <input type="text" class="form-control" id="subsidyName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Department</label>
                                <input type="text" class="form-control" id="subsidyDepartment" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Description</label>
                                <textarea class="form-control" id="subsidyDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">More Details Link</label>
                                <input type="url" class="form-control" id="subsidyMoreDetailsLink" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0 pt-0 justify-content-center">
                        <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary px-4" onclick="saveSubsidy()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadSubsidies();
}

async function loadSubsidies() {
    try {
        const response = await fetch(`${config.API_URL}/api/subsidies?isAdmin=true`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load subsidies');
        }
        
        const subsidies = await response.json();
        console.log('Raw response:', subsidies);
        displaySubsidies(subsidies);
    } catch (error) {
        console.error('Error loading subsidies:', error);
        Swal.fire('Error', 'Failed to load subsidies', 'error');
    }
}

// Fix saveSubsidy function
window.saveSubsidy = async function () {
    const form = document.getElementById('subsidyForm');
    const subsidyData = {
        name: document.getElementById('subsidyName').value,
        department: document.getElementById('subsidyDepartment').value,
        description: document.getElementById('subsidyDescription').value,
        moreDetailsLink: document.getElementById('subsidyMoreDetailsLink').value
    };

    const subsidyId = form.dataset.subsidyId;
    const url = `${config.API_URL}/api/subsidies${subsidyId ? `/${subsidyId}` : ''}`; // Changed from /subsidies to /api/subsidies
    const method = subsidyId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(subsidyData)
        });

        if (response.ok) {
            Swal.fire('Success', `Subsidy ${subsidyId ? 'updated' : 'added'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('subsidyModal')).hide();
            loadSubsidies();
        } else {
            throw new Error('Failed to save subsidy');
        }
    } catch (error) {
        console.error('Error saving subsidy:', error);
        Swal.fire('Error', 'Failed to save subsidy', 'error');
    }
}

// Fix editSubsidy function
window.editSubsidy =  async function (subsidyId) {
    try {
        const response = await fetch(`${config.API_URL}/api/subsidies/${subsidyId}`, { // Changed from /subsidies to /api/subsidies
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch subsidy details');
        }
        
        const subsidyData = await response.json();
        openSubsidyForm(subsidyData);
    } catch (error) {
        console.error('Error fetching subsidy details:', error);
        Swal.fire('Error', 'Failed to load subsidy details', 'error');
    }
}

// Fix deleteSubsidy function
window.deleteSubsidy = async function (subsidyId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${config.API_URL}/api/subsidies/${subsidyId}`, { // Changed from /subsidies to /api/subsidies
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                Swal.fire('Deleted!', 'Subsidy has been deleted.', 'success');
                loadSubsidies();
            } else {
                throw new Error('Failed to delete subsidy');
            }
        } catch (error) {
            console.error('Error deleting subsidy:', error);
            Swal.fire('Error', 'Failed to delete subsidy', 'error');
        }
    }
}

window.editJob = async function (jobId) {
    try {
        const response = await fetch(`${config.API_URL}/jobschemes/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch job details');
        }
        
        const jobData = await response.json();
        
        // Open modal with job data
        const modal = new bootstrap.Modal(document.getElementById('jobModal'));
        document.getElementById('jobModalTitle').textContent = 'Edit Job';
        document.getElementById('jobTitle').value = jobData.title;
        document.getElementById('jobDescription').value = jobData.description;
        document.getElementById('jobEligibility').value = jobData.eligibility;
        document.getElementById('jobLink').value = jobData.applicationLink;
        document.getElementById('jobForm').dataset.jobId = jobData._id;
        
        modal.show();
    } catch (error) {
        console.error('Error fetching job details:', error);
        Swal.fire('Error', 'Failed to load job details', 'error');
    }
 } // Add missing closing brace

async function loadSubscribersManager() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Subscribers</h2>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Subscription Status</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="subscribersTableBody">
                        <tr>
                            <td colspan="5" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    loadSubscribers();
}

async function loadSubscribers() {
    try {
        const response = await fetch(`${config.API_URL}/api/subscribers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load subscribers');
        }
        
        const subscribers = await response.json();
        displaySubscribers(subscribers);
    } catch (error) {
        console.error('Error loading subscribers:', error);
        Swal.fire('Error', 'Failed to load subscribers', 'error');
    }
}

window.deleteSubscriber =  async function (subscriberId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${config.API_URL}/api/subscribers/${subscriberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                Swal.fire('Deleted!', 'Subscriber has been deleted.', 'success');
                loadSubscribers();
            } else {
                throw new Error('Failed to delete subscriber');
            }
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            Swal.fire('Error', 'Failed to delete subscriber', 'error');
        }
    }
}

function displaySubscribers(subscribers) {
    const tbody = document.getElementById('subscribersTableBody');
    
    if (!subscribers || subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No subscribers found</td></tr>';
        return;
    }

    tbody.innerHTML = subscribers.map(subscriber => `
        <tr>
            <td>${subscriber.name || 'N/A'}</td>
            <td>${subscriber.phone || 'N/A'}</td>
            <td>
                <span class="badge ${subscriber.jobAlertSubscription ? 'bg-success' : 'bg-danger'}">
                    ${subscriber.jobAlertSubscription ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${subscriber.subscriptionExpiresAt ? new Date(subscriber.subscriptionExpiresAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSubscriber('${subscriber._id}')">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.openSubsidyForm = function (subsidyData = null) {
    const modal = document.getElementById('subsidyModal');
    const form = document.getElementById('subsidyForm');
    const modalTitle = document.getElementById('subsidyModalTitle');

    // Reset form
    form.reset();
    form.dataset.subsidyId = '';

    // If editing existing subsidy
    if (subsidyData) {
        modalTitle.textContent = 'Edit Subsidy';
        form.dataset.subsidyId = subsidyData._id;
        document.getElementById('subsidyName').value = subsidyData.name;
        document.getElementById('subsidyDepartment').value = subsidyData.department;
        document.getElementById('subsidyDescription').value = subsidyData.description;
        document.getElementById('subsidyMoreDetailsLink').value = subsidyData.moreDetailsLink;
    } else {
        modalTitle.textContent = 'Add New Subsidy';
    }

    // Show modal
    new bootstrap.Modal(modal).show();
}

function displaySubsidies(subsidies) {
    const tbody = document.getElementById('subsidiesTableBody');
    
    if (!subsidies || subsidies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No subsidies found</td></tr>';
        return;
    }

    tbody.innerHTML = subsidies.map(subsidy => `
        <tr>
            <td>${subsidy.name || 'N/A'}</td>
            <td>${subsidy.department || 'N/A'}</td>
            <td>${subsidy.description || 'N/A'}</td>
            <td>${new Date(subsidy.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editSubsidy('${subsidy._id}')">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSubsidy('${subsidy._id}')">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        </tr>
    `).join('');
}
// ... existing code ...

window.loadPaymentsManager = async function ()  {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid py-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                <h2 class="mb-3 mb-sm-0">Revenue Management</h2>
                <div>
                    <select id="timeFilter" class="form-select me-2 d-inline-block" style="width: auto;">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            <!-- Revenue Stats Cards -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6 class="card-title">Total Revenue</h6>
                            <h3 class="mb-0" id="totalRevenue">₹0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6 class="card-title">Total Transactions</h6>
                            <h3 class="mb-0" id="totalTransactions">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6 class="card-title">Average Transaction</h6>
                            <h3 class="mb-0" id="avgTransaction">₹0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h6 class="card-title">Active Subscribers</h6>
                            <h3 class="mb-0" id="activeSubscribers">0</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="card mb-4">
                <div class="card-body">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-3">Recent Transactions</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="transactionsTableBody">
                                <tr>
                                    <td colspan="5" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize the revenue data
    await loadRevenueData();
    
    // Add event listener for time filter
    document.getElementById('timeFilter').addEventListener('change', loadRevenueData);
}

window.loadRevenueData = async function () {
    try {
        const timeFilter = document.getElementById('timeFilter').value;
        const response = await fetch(`${config.API_URL}/api/admin/revenue?timeFrame=${timeFilter}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch revenue data');
        }

        const data = await response.json();
        updateRevenueStats(data);
        updateRevenueChart(data.chartData);
        displayTransactions(data.transactions);
    } catch (error) {
        console.error('Error loading revenue data:', error);
        Swal.fire('Error', 'Failed to load revenue data', 'error');
    }
}

function updateRevenueStats(data) {
    document.getElementById('totalRevenue').textContent = `₹${data.totalRevenue.toLocaleString()}`;
    document.getElementById('totalTransactions').textContent = data.totalTransactions.toLocaleString();
    document.getElementById('avgTransaction').textContent = `₹${data.averageTransaction.toLocaleString()}`;
    document.getElementById('activeSubscribers').textContent = data.activeSubscribers.toLocaleString();
}

function updateRevenueChart(chartData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    if (window.revenueChart) {
        window.revenueChart.destroy();
    }

    window.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Revenue',
                data: chartData.values,
                borderColor: '#0d6efd',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Trend'
                }
            }
        }
    });
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(tx => `
        <tr>
            <td>${tx.transactionId}</td>
            <td>${tx.userName}</td>
            <td>₹${tx.amount.toLocaleString()}</td>
            <td>${new Date(tx.date).toLocaleDateString()}</td>
            <td>
                <span class="badge bg-${tx.status === 'success' ? 'success' : 'danger'}">
                    ${tx.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// ... rest of the existing code ...