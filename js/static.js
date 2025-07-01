const populateExplainerPanel = () => {
    d3.select("#explainer-panel")
        .style("position", "relative")
        .style("top", "20px")
        .style("margin-bottom", "20px");

    // Set the header text for the explainer panel
    d3.select("#explainer-header")
        .text("About this project");

    const explainerPanel = d3.select("#explainer-panel");

    explainerPanel.html(defaultExplainerContent);
};

// Store the default explainer panel content
const defaultExplainerContent = `
        <p align="right">This visualization shows MPs' expenses and declared interests.</p>
        <p align="right">It's particularly designed to highlight the relation between MPs' behaviour personally and politically.</p>
        <p align="right">For example, MPs with rental properties who are charging rent to the taxpayer, or MPs who support benefit cuts but 
        seem to take a lot in expenses or gifts.</p>
        <p align="right">Use the filters to explore data by expense type or MPs with rental properties.</p>
        <p align="right">Hover over the circles to see more details about each MP's expenses.</p>
        <p align="right">Try clicking on an MP to see more about them.</p>
        <p align="right">Or try clicking HERE to see a particularly interesting MP.</p>
    `

// Call the function to populate the explainer panel
populateExplainerPanel();

// Show/hide popup on mobile
function setupPanelPopup() {
  const infoPanel = document.getElementById('info-panel');
  const openBtn = document.getElementById('open-panel-btn');
  const closeBtn = document.getElementById('close-panel-btn');

  function checkScreen() {
    if (window.innerWidth <= 820) {
      openBtn.style.display = 'block';
      closeBtn.style.display = 'block';
      infoPanel.classList.remove('popup-open');
    } else {
      openBtn.style.display = 'none';
      closeBtn.style.display = 'none';
      infoPanel.classList.remove('popup-open');
    }
  }

  openBtn.addEventListener('click', () => {
    infoPanel.classList.add('popup-open');
  });
  closeBtn.addEventListener('click', () => {
    infoPanel.classList.remove('popup-open');
  });

  window.addEventListener('resize', checkScreen);
  checkScreen();
}

setupPanelPopup();

// Automatically open the popup on small screens when the page loads
if (window.innerWidth <= 820) {
  document.getElementById('info-panel').classList.add('popup-open');
}