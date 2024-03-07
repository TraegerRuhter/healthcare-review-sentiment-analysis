const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const result = document.getElementById('result');

analyzeBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (text.trim() === '') {
        result.innerHTML = '<p>Please enter some text.</p>';
        return;
    }

    // Send the text to the backend for sentiment analysis
    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => response.json())
    .then(data => {
        // Display the sentiment analysis result
        const sentimentScore = data.sentiment;
        const barWidth = (sentimentScore / 6) * 100; // Adjust the scale as needed
        result.innerHTML = `
            <div>Sentiment Score: ${sentimentScore.toFixed(2)}</div>
            <div class="bar-container">
                <div class="bar" style="width: ${barWidth}%;"></div>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        result.innerHTML = '<p>An error occurred while analyzing the sentiment.</p>';
    });
});