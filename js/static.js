const populateExplainerPanel = () => {
    d3.select("#explainer-panel")
        .style("position", "relative")
        .style("top", "20px")
        .style("margin-bottom", "20px");

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
        <p align="right">Data sources: <a href="https://www.theipsa.org.uk/mp-staffing-business-costs" target="_blank">IPSA</a>, 
        <a href="https://www.parliament.uk" target="_blank">Parliament</a></p>
    `

// Call the function to populate the explainer panel
populateExplainerPanel();