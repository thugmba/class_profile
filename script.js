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
    createWorldMap();
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
                    '#667eea', '#764ba2', '#f093fb', '#4facfe',
                    '#43e97b', '#fa709a', '#fee140', '#30cfd0'
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
                backgroundColor: ['#4facfe', '#f093fb'],
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
                    backgroundColor: '#4facfe',
                    borderColor: '#4facfe',
                    borderWidth: 1
                },
                {
                    label: 'Female',
                    data: femaleData,
                    backgroundColor: '#f093fb',
                    borderColor: '#f093fb',
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

// Create world map visualization
function createWorldMap() {
    const countryCounts = {};
    
    // Country coordinates (latitude, longitude) for label placement
    const countryCoordinates = {
        'China': { lat: 35, lon: 105 },
        'India': { lat: 20, lon: 78 },
        'United States': { lat: 37, lon: -95 },
        'Brazil': { lat: -14, lon: -55 },
        'Japan': { lat: 36, lon: 138 },
        'Germany': { lat: 51, lon: 10 },
        'United Kingdom': { lat: 55, lon: -3 },
        'France': { lat: 46, lon: 2 },
        'Canada': { lat: 56, lon: -106 },
        'Australia': { lat: -25, lon: 133 },
        'Mexico': { lat: 23, lon: -102 },
        'South Korea': { lat: 37, lon: 127 },
        'Spain': { lat: 40, lon: -4 },
        'Italy': { lat: 41.8, lon: 12.5 },
        'Netherlands': { lat: 52, lon: 5 },
        'Switzerland': { lat: 46.8, lon: 8.2 },
        'Sweden': { lat: 60, lon: 18 },
        'Norway': { lat: 60, lon: 8 },
        'Singapore': { lat: 1.3, lon: 103.8 },
        'Hong Kong': { lat: 22.3, lon: 114.2 },
        'Thailand': { lat: 15, lon: 100 },
        'Vietnam': { lat: 14, lon: 107 },
        'Indonesia': { lat: -2, lon: 113 },
        'Malaysia': { lat: 4, lon: 101 },
        'Philippines': { lat: 12, lon: 121 },
        'Taiwan': { lat: 23.5, lon: 120.5 },
        'Pakistan': { lat: 30, lon: 69 },
        'Bangladesh': { lat: 23.6, lon: 90.3 },
        'Sri Lanka': { lat: 7, lon: 81 },
        'Iran': { lat: 32, lon: 53 },
        'Saudi Arabia': { lat: 23.5, lon: 44.2 },
        'United Arab Emirates': { lat: 23.4, lon: 53.8 },
        'Egypt': { lat: 26.8, lon: 30.8 },
        'South Africa': { lat: -30, lon: 22.5 },
        'Nigeria': { lat: 9, lon: 8 },
        'Kenya': { lat: -0.0236, lon: 37.9062 },
        'Turkey': { lat: 39, lon: 35 },
        'Russia': { lat: 61.5, lon: 105.3 },
        'Poland': { lat: 52, lon: 19 },
        'Greece': { lat: 39, lon: 21.8 },
        'Portugal': { lat: 39.3, lon: -8.2 },
        'Belgium': { lat: 50.5, lon: 4.5 },
        'Austria': { lat: 47.5, lon: 14.5 },
        'Denmark': { lat: 56, lon: 9.5 },
        'Finland': { lat: 62, lon: 25 },
        'Ireland': { lat: 53.4, lon: -8 },
        'New Zealand': { lat: -40.9, lon: 174.9 },
        'Argentina': { lat: -38.4, lon: -63.6 },
        'Colombia': { lat: 4.5, lon: -74.3 },
        'Chile': { lat: -30, lon: -71 },
        'Peru': { lat: -9, lon: -76 }
    };
    const countryToCode = {
        'China': 'CHN',
        'India': 'IND',
        'United States': 'USA',
        'Brazil': 'BRA',
        'Japan': 'JPN',
        'Germany': 'DEU',
        'United Kingdom': 'GBR',
        'France': 'FRA',
        'Canada': 'CAN',
        'Australia': 'AUS',
        'Mexico': 'MEX',
        'South Korea': 'KOR',
        'Spain': 'ESP',
        'Italy': 'ITA',
        'Netherlands': 'NLD',
        'Switzerland': 'CHE',
        'Sweden': 'SWE',
        'Norway': 'NOR',
        'Singapore': 'SGP',
        'Hong Kong': 'HKG',
        'Thailand': 'THA',
        'Vietnam': 'VNM',
        'Indonesia': 'IDN',
        'Malaysia': 'MYS',
        'Philippines': 'PHL',
        'Taiwan': 'TWN',
        'Pakistan': 'PAK',
        'Bangladesh': 'BGD',
        'Sri Lanka': 'LKA',
        'Iran': 'IRN',
        'Saudi Arabia': 'SAU',
        'United Arab Emirates': 'ARE',
        'Egypt': 'EGY',
        'South Africa': 'ZAF',
        'Nigeria': 'NGA',
        'Kenya': 'KEN',
        'Turkey': 'TUR',
        'Russia': 'RUS',
        'Poland': 'POL',
        'Greece': 'GRC',
        'Portugal': 'PRT',
        'Belgium': 'BEL',
        'Austria': 'AUT',
        'Denmark': 'DNK',
        'Finland': 'FIN',
        'Ireland': 'IRL',
        'New Zealand': 'NZL',
        'Argentina': 'ARG',
        'Colombia': 'COL',
        'Chile': 'CHL',
        'Peru': 'PER'
    };

    classData.forEach(item => {
        const countryName = item.country.split('(')[0].trim();
        countryCounts[countryName] = (countryCounts[countryName] || 0) + 1;
    });

    const countries = Object.keys(countryCounts);
    const codes = countries.map(c => countryToCode[c] || 'UNK');
    const values = Object.values(countryCounts);

    const data = [{
        type: 'choropleth',
        locations: codes,
        z: values,
        text: countries,
        colorscale: [
            [0, '#e8f4f8'],
            [0.2, '#a8d5e2'],
            [0.4, '#5fb3d5'],
            [0.6, '#2a7fa0'],
            [0.8, '#1a4d63'],
            [1, '#0d2a3f']
        ],
        autocolorscale: false,
        reversescale: false,
        showscale: false,
        marker_line_color: 'darkgray',
        marker_line_width: 0.5,
        hovertemplate: '<b>%{text}</b><br>Students: %{z}<extra></extra>'
    }];

    const layout = {
        title: { text: 'Global Student Distribution', x: 0.5, xanchor: 'center' },
        geo: {
            projection_type: 'natural earth',
            showland: true,
            landcolor: 'rgb(243, 243, 243)',
            coastcolor: 'rgb(204, 204, 204)',
            countrycolor: 'rgb(204, 204, 204)'
        },
        height: 700,
        margin: { l: 50, r: 50, t: 80, b: 50 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
    };

    Plotly.newPlot('worldMap', data, layout, { responsive: true, displayModeBar: false });
}
