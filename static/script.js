const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const result = document.getElementById('result');

// Function to make a POST request to the model API
async function query(data) {
    const response = await fetch("https://api-inference.huggingface.co/models/brettclaus/Hospital_Reviews", {
        headers: {
            Authorization: "Bearer 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"
        },
        method: "POST",
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}

// Event listener for the analyze button
analyzeBtn.addEventListener('click', async () => {
    performAnalysis();
});

// event listener for the enter key
textInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        performAnalysis();
    }
});

// Function to perform the sentiment analysis
async function performAnalysis() {
    const text = textInput.value;
    if (text.trim() === '') {
        result.innerHTML = '<p>Please enter some text.</p>';
        return;
    }
    result.innerHTML = '<p>Loading...</p>';

    try {
        const apiResponse = await query({ inputs: text });
        console.log('API Response:', apiResponse);

        result.innerHTML = '';
        createPieChart(apiResponse[0]);
    } catch (error) {
        console.error('Error:', error);
        result.innerHTML = '<p>An error occurred while analyzing the sentiment. Please try again.</p>';
    }
}

let pieChart = null; // Global variable to hold the chart instance

function createPieChart(data) {
    // Check if data is valid and not empty
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid or empty data for pie chart');
        result.innerHTML = '<p>An error occurred while analyzing the sentiment. Please try again.</p>';
        return;
    }

    // Get the canvas element and its context
    const ctx = document.getElementById('pieChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (pieChart) {
        pieChart.destroy();
    }

    // Extract labels and scores from data
    const labels = data.map(item => item.label);
    const scores = data.map(item => item.score);

    // Calculate total score for percentages
    const totalScore = scores.reduce((acc, value) => acc + value, 0);

    // Assign colors based on label
    const backgroundColors = assignColors(labels);
    const borderColors = assignColors(labels, true);

    // Create the pie chart
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sentiment Analysis',
                data: scores,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: 'white', // Set the legend labels to white
                        font: {
                            size: 15
                        },
                        generateLabels: function (chart) {
                            const data = chart.data;
                            return data.labels.map((label, index) => {
                                const value = data.datasets[0].data[index];
                                const percentage = Math.round((value / totalScore) * 100); // Round to nearest percent
                                return {
                                    text: `${label}: ${percentage}%`, 
                                    fillStyle: data.datasets[0].backgroundColor[index],
                                    fontColor: 'white',
                                    fontStyle: 'bold',
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += Math.round(context.parsed * 100) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    window.scrollBy(0, 120);
}

// Function to assign colors based on sentiment label
function assignColors(labels, isBorderColor = false) {
    return labels.map(label => {
        switch (label.toLowerCase()) {
            case 'positive':
                return isBorderColor ? 'rgba(54, 162, 235, 1)' : 'rgba(54, 162, 235, 0.5)';
            case 'mixed':
                return isBorderColor ? 'rgba(153, 102, 255, 1)' : 'rgba(153, 102, 255, 0.5)';
            case 'negative':
                return isBorderColor ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 0.5)';
            default:
                return isBorderColor ? 'rgba(201, 203, 207, 1)' : 'rgba(201, 203, 207, 0.5)';
        }
    });
}
