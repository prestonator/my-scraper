document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const data = {
            db: document.getElementById('county-select').value,
            FiledDateL: document.getElementById('filed-after-date').value,
            ClosedDateH: document.getElementById('closed-before-date').value,
            UserAgent: document.getElementById('oscn-user-agent').value
        };

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});