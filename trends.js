// GMBA Enrollment Trend Data (Academic Years 107-114)
const trendData = {
    years: ['AY 107', 'AY 108', 'AY 109', 'AY 110', 'AY 111', 'AY 112', 'AY 113', 'AY 114'],

    totalEnrolled: [12, 14, 13, 34, 31, 34, 36, 40],

    channels: {
        local:           [5,  9,  6,  4,  9, 10,  8,  8],
        intlFall:        [4,  3,  4, 15, 16, 14, 16, 31],
        intlSpring:      [3,  2,  3, 15,  7,  9, 11,  null],
        overseasChinese: [0,  0,  0,  0,  0,  1,  1,  1]
    },

    intlApplicants: {
        fall:   [30, 30, 39, 76, 75, 71,  84, 100],
        spring: [16, 17, 36, 43, 48, 23,  59,  57]
    },

    gender: {
        male:   [5,  4,  3, 17, 16, 17, 19, 15],
        female: [7, 10, 10, 17, 16, 17, 17, 25]
    },

    countries: {
        Indonesia: [3,  1,  3, 15, 19, 18, 17, 27],
        Taiwan:    [5,  9,  6,  4,  4,  6,  3,  1],
        Vietnam:   [0,  0,  0,  2,  1,  3,  4,  7],
        Mongolia:  [2,  1,  0,  1,  0,  3,  1,  1],
        Others:    [2,  3,  4, 12,  8,  4, 11,  4]
    },

    countryDiversity: [5, 6, 6, 10, 9, 8, 11, 7]
};

const charts = {};

document.addEventListener('DOMContentLoaded', () => {
    createEnrollmentTrendChart();
    createChannelChart();
    createApplicantChart();
    createCountryTrendChart();
    createGenderTrendChart();
    createDiversityChart();
});

// 1. Total Enrollment Growth - Line with area fill
function createEnrollmentTrendChart() {
    const ctx = document.getElementById('enrollmentTrendChart').getContext('2d');
    charts.enrollment = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.years,
            datasets: [{
                label: 'Total Enrolled',
                data: trendData.totalEnrolled,
                borderColor: '#1a3a52',
                backgroundColor: 'rgba(26, 58, 82, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#1a3a52',
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const i = context.dataIndex;
                            if (i === 0) return '';
                            const prev = trendData.totalEnrolled[i - 1];
                            const curr = trendData.totalEnrolled[i];
                            const change = curr - prev;
                            const pct = ((change / prev) * 100).toFixed(0);
                            const sign = change >= 0 ? '+' : '';
                            return `Change: ${sign}${change} (${sign}${pct}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Students', font: { weight: 'bold' } },
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// 2. Enrollment by Admission Channel - Stacked bar
function createChannelChart() {
    const ctx = document.getElementById('channelChart').getContext('2d');
    charts.channel = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.years,
            datasets: [
                {
                    label: 'Local Students',
                    data: trendData.channels.local,
                    backgroundColor: '#1a3a52'
                },
                {
                    label: 'International (Fall)',
                    data: trendData.channels.intlFall,
                    backgroundColor: '#2a7fa0'
                },
                {
                    label: 'International (Spring)',
                    data: trendData.channels.intlSpring,
                    backgroundColor: '#5fb3d5'
                },
                {
                    label: 'Overseas Chinese',
                    data: trendData.channels.overseasChinese,
                    backgroundColor: '#c9a961'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(contexts) {
                            const i = contexts[0].dataIndex;
                            const total = trendData.totalEnrolled[i];
                            return `\nTotal: ${total}`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Students', font: { weight: 'bold' } },
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// 3. International Applicant Pool - Line chart
function createApplicantChart() {
    const totalApplicants = trendData.intlApplicants.fall.map((f, i) =>
        f + trendData.intlApplicants.spring[i]
    );

    const ctx = document.getElementById('applicantChart').getContext('2d');
    charts.applicant = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.years,
            datasets: [
                {
                    label: 'Fall Applicants',
                    data: trendData.intlApplicants.fall,
                    borderColor: '#2a7fa0',
                    backgroundColor: 'rgba(42, 127, 160, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Spring Applicants',
                    data: trendData.intlApplicants.spring,
                    borderColor: '#5fb3d5',
                    backgroundColor: 'rgba(95, 179, 213, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Total International Applicants',
                    data: totalApplicants,
                    borderColor: '#1a3a52',
                    borderWidth: 3,
                    borderDash: [6, 4],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#1a3a52'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Applicants', font: { weight: 'bold' } }
                }
            }
        }
    });
}

// 4. Country Distribution Over Time - Stacked bar
function createCountryTrendChart() {
    const palette = {
        Indonesia: '#1a3a52',
        Taiwan:    '#c9a961',
        Vietnam:   '#e8784d',
        Mongolia:  '#5fb3d5',
        Others:    '#b0bec5'
    };

    const datasets = Object.entries(trendData.countries).map(([country, data]) => ({
        label: country,
        data: data,
        backgroundColor: palette[country]
    }));

    const ctx = document.getElementById('countryTrendChart').getContext('2d');
    charts.countryTrend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(contexts) {
                            const i = contexts[0].dataIndex;
                            const total = trendData.totalEnrolled[i];
                            const country = contexts[0].dataset.label;
                            const val = contexts[0].raw;
                            const pct = ((val / total) * 100).toFixed(0);
                            return `${pct}% of class`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Students', font: { weight: 'bold' } },
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// 5. Gender Distribution Over Time - Stacked bar
function createGenderTrendChart() {
    const ctx = document.getElementById('genderTrendChart').getContext('2d');
    charts.genderTrend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.years,
            datasets: [
                {
                    label: 'Male',
                    data: trendData.gender.male,
                    backgroundColor: '#1a3a52'
                },
                {
                    label: 'Female',
                    data: trendData.gender.female,
                    backgroundColor: '#c9a961'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const i = context.dataIndex;
                            const total = trendData.gender.male[i] + trendData.gender.female[i];
                            const pct = ((context.raw / total) * 100).toFixed(0);
                            return `${pct}% of class`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Students', font: { weight: 'bold' } },
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// 6. Country Diversity - Bar chart with trend line
function createDiversityChart() {
    const ctx = document.getElementById('diversityChart').getContext('2d');
    charts.diversity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.years,
            datasets: [{
                label: 'Unique Countries',
                data: trendData.countryDiversity,
                backgroundColor: trendData.countryDiversity.map((val, i) => {
                    const max = Math.max(...trendData.countryDiversity);
                    const ratio = val / max;
                    return `rgba(26, 58, 82, ${0.4 + ratio * 0.6})`;
                }),
                borderColor: '#1a3a52',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const i = context.dataIndex;
                            const total = trendData.totalEnrolled[i];
                            return `Total students: ${total}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Countries', font: { weight: 'bold' } },
                    ticks: { stepSize: 2 }
                }
            }
        }
    });
}
