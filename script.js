// Global variables
let classData = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    updateStats();
    createCharts();
});

// Load and parse CSV data
async function loadData() {
    try {
        const response = await fetch('11401_Class_Profile_Eng.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        // Parse CSV
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');

        classData = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',');
                return {
                    country: values[0]?.trim() || '',
                    gender: values[1]?.trim() || '',
                    major: values[2]?.trim() || ''
                };
            })
            .filter(item => item.country && item.gender);

        console.log(`Successfully loaded ${classData.length} records`);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Make sure you are running a local web server (python -m http.server 8000) and access the file via http://localhost:8000/index.html');
    }
}

// Update statistics cards
function updateStats() {
    const totalStudents = classData.length;
    const countries = new Set(classData.map(d => d.country));
    const majors = new Set(classData.map(d => d.major));

    animateNumber('totalStudents', totalStudents);
    animateNumber('totalCountries', countries.size);
    animateNumber('totalMajors', majors.size);
}

// Animate number counting
function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// Create all charts
function createCharts() {
    createCountryChart();
    createGenderChart();
    createMajorChart();
    createGenderByCountryChart();
}

// Country distribution chart
function createCountryChart() {
    const countryCounts = {};
    classData.forEach(item => {
        // Extract country name (remove text in parentheses)
        const country = item.country.split('(')[0].trim();
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1]);

    const ctx = document.getElementById('countryChart').getContext('2d');
    charts.country = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedCountries.map(c => c[0]),
            datasets: [{
                data: sortedCountries.map(c => c[1]),
                backgroundColor: [
                    '#1a3a52', '#c9a961', '#2a7fa0', '#5fb3d5',
                    '#e8784d', '#b0bec5', '#6b8e4e', '#9b59b6'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Add statistics below chart
    const statsDiv = document.getElementById('countryStats');
    statsDiv.innerHTML = sortedCountries.map(([country, count]) => {
        const percentage = ((count / classData.length) * 100).toFixed(1);
        return `<strong>${country}:</strong> ${count} students (${percentage}%)`;
    }).join('<br>');
}

// Gender distribution chart
function createGenderChart() {
    const genderCounts = {
        'Male': 0,
        'Female': 0
    };

    classData.forEach(item => {
        if (item.gender === 'Male') genderCounts['Male']++;
        else if (item.gender === 'Female') genderCounts['Female']++;
    });

    const ctx = document.getElementById('genderChart').getContext('2d');
    charts.gender = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [genderCounts.Male, genderCounts.Female],
                backgroundColor: ['#1a3a52', '#c9a961'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Add statistics
    const statsDiv = document.getElementById('genderStats');
    const malePercentage = ((genderCounts.Male / classData.length) * 100).toFixed(1);
    const femalePercentage = ((genderCounts.Female / classData.length) * 100).toFixed(1);
    statsDiv.innerHTML = `
        <strong>Male:</strong> ${genderCounts.Male} students (${malePercentage}%)<br>
        <strong>Female:</strong> ${genderCounts.Female} students (${femalePercentage}%)
    `;
}

// Major distribution chart
function createMajorChart() {
    const majorCounts = {};
    
    // Function to standardize major names
    function standardizeMajor(major) {
        if (!major) return '';
        
        // Remove text in parentheses
        let standardized = major.replace(/\s*\([^)]*\)/g, '').trim();
        
        // Consolidate common variations
        const variations = [
            { pattern: /finance/i, name: 'Finance' },
            { pattern: /business|commerce/i, name: 'Business Administration' },
            { pattern: /marketing/i, name: 'Marketing' },
            { pattern: /accounting/i, name: 'Accounting' },
            { pattern: /economics/i, name: 'Economics' },
            { pattern: /management|general management/i, name: 'Management' },
            { pattern: /technology|information technology|it/i, name: 'Information Technology' },
            { pattern: /engineering/i, name: 'Engineering' },
            { pattern: /consulting/i, name: 'Consulting' },
            { pattern: /strategy/i, name: 'Strategy' },
            { pattern: /operations/i, name: 'Operations' },
            { pattern: /supply chain|logistics/i, name: 'Supply Chain & Logistics' },
            { pattern: /human resource|hr/i, name: 'Human Resources' },
            { pattern: /leadership/i, name: 'Leadership' },
            { pattern: /data science|analytics/i, name: 'Data Science & Analytics' }
        ];
        
        for (const variation of variations) {
            if (variation.pattern.test(standardized)) {
                return variation.name;
            }
        }
        
        return standardized;
    }
    
    classData.forEach(item => {
        if (item.major) {
            const standardized = standardizeMajor(item.major);
            if (standardized) {
                majorCounts[standardized] = (majorCounts[standardized] || 0) + 1;
            }
        }
    });

    const sortedMajors = Object.entries(majorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15 majors

    const ctx = document.getElementById('majorChart').getContext('2d');
    charts.major = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMajors.map(m => m[0].length > 30 ? m[0].substring(0, 30) + '...' : m[0]),
            datasets: [{
                label: 'Number of Students',
                data: sortedMajors.map(m => m[1]),
                backgroundColor: '#1a3a52',
                borderColor: '#0d2a3f',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return sortedMajors[index][0];
                        },
                        label: function(context) {
                            return `Students: ${context.parsed.x}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Gender by country chart
function createGenderByCountryChart() {
    const countryGenderCounts = {};

    classData.forEach(item => {
        const country = item.country.split('(')[0].trim();
        if (!countryGenderCounts[country]) {
            countryGenderCounts[country] = { male: 0, female: 0 };
        }
        if (item.gender === 'Male') countryGenderCounts[country].male++;
        else if (item.gender === 'Female') countryGenderCounts[country].female++;
    });

    const countries = Object.keys(countryGenderCounts).sort();
    const maleData = countries.map(c => countryGenderCounts[c].male);
    const femaleData = countries.map(c => countryGenderCounts[c].female);

    const ctx = document.getElementById('genderByCountryChart').getContext('2d');
    charts.genderByCountry = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [
                {
                    label: 'Male',
                    data: maleData,
                    backgroundColor: '#1a3a52',
                    borderColor: '#1a3a52',
                    borderWidth: 1
                },
                {
                    label: 'Female',
                    data: femaleData,
                    backgroundColor: '#c9a961',
                    borderColor: '#c9a961',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: { stacked: false },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

