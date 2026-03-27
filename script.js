// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        section.scrollIntoView({ behavior: 'smooth' });
    });
});

// Scroll to approach section from hero button
function scrollToApproach() {
    document.querySelector('#approach').scrollIntoView({ behavior: 'smooth' });
}

// Simulated booking function (Replace this later with a Calendly link)
function openBooking() {
    alert("This would open a Calendly pop-up for the client to book a 15-minute Google Meet with you.");
    // Example of what you will actually use later:
    // window.open('https://calendly.com/your-calendly-link', '_blank');
}
