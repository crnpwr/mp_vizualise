//import { createSwarmTooltip } from './tooltips.js';

// Load the data here
d3.csv("../data/mp_data_summary.csv", d3.autoType).then(data => {
    console.log("mp data", data);
    drawAccomSwarm(data, "expenses_total", true); // Draw the swarm graph with the total expenses
    createExpenseFilterButtons(data); // Create expense filter buttons
    createMPFilterButtons(data); // Create MP filter buttons
  });

// Constants for colors
const ochre = "#CC7722";
const teal = "#b2d8d8";
const cream = "#ffdd0";
const turquoise = "#40E0D0";
const seafoamGreen = "#9FE2BF";
const mintGreen = "#98FF98";
const skyBlue = "#87CEEB";
const periwinkle = "#CCCCFF";
const paleAqua = "#B2DFEE";

/*
Examples of Colors that Pair Well with Cream:

    Dark Neutrals: Black, navy blue, dark brown, forest green.
    Warm Tones: Orange, yellow, red.
    Cool Tones: Purple, lavender, teal.
    Complementary Colors: Light blue (or Lavender Blue)
*/

// Create filter buttons for each expense type
const createExpenseFilterButtons = (data) => {
    const buttonContainer = d3.select("#filter-buttons");

    // Using the expenseTypes array from shared_constants.js
    expenseTypes.forEach(type => {
        buttonContainer
            .append("button")
            .attr("class", "filter-button")
            .attr("data-type", type.id)
            // Insert the emoji before the text, making it larger
            .html(`<span style="font-size: 1.5em;">${type.emoji}</span> ${type.name}`)
            //.text(type.name) // Use the name from the expenseTypes array
            .on("click", () => {
                // Highlight active value button
                d3.selectAll(".filter-button")
                    .classed("active", false); // Remove active class from all buttons
                d3.select(`.filter-button[data-type="${type.id}"]`)
                    .classed("active", true); // Add active class to the clicked button

                // Set all mp-filter buttons to inactive
                d3.selectAll(".filter-button-mp")
                    .classed("active", false);
                
                // Handle button click
                const updatedData = drawAccomSwarm(data, type.value_field, false); 
                
                // Change the header text to reflect the selected expense type
                d3.select("#accom-swarm-header")
                    .text(type.header_text);
                });
            });

};


const createMPFilterButtons = async (data) => {
    const buttonContainer = d3.select("#mp-filter-buttons"); // Select the container for MP filter buttons

    // Create buttons for each filter
    mpFilters.forEach(filter => {
        buttonContainer
            .append("button")
            .attr("class", "filter-button-mp")
            .attr("data-type", filter.id) // Use the filter id as data-type
            .text(`${filter.emoji} ${filter.name}`) // Use emoji and name for button label
            .on("click", () => {
                d3.selectAll(".filter-button-mp")
                    .classed("active", false); // Remove active class from all buttons
                d3.select(`.filter-button-mp[data-type="${filter.id}"]`)
                    .classed("active", true); // Add active class to the clicked button
                updateCircleOpacity(
                    data.filter(d => d[filter.field] === filter.value).map(d => d.mp_id)
                ); // Update circle opacity based on precomputed inclusions
            });
    });
};


// Swarm graph for MPs expenses expense claims
// This is a force-directed graph where each circle represents an MP's claim
// (Called accom-swarm because it was originally for accommodation expenses)
const drawAccomSwarm = (data, value_field, draw_new) => {
    // Set constants
    const margin = {top: 5, left: 40, right: 40, bottom: 20};
    const width = 500;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (draw_new) {
        // If drawing a new chart, set up the SVG and inner chart
        // Append SVG container
        const svg = d3.select("#accom-swarm")
            .append("svg")
                .attr("viewBox", `0, 0, ${width}, ${height}`);

        // Append inner chart group
        innerChart = svg
            .append("g")
            .attr("class", "inner-chart")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
    } else {
        // If not drawing a new chart, just select the existing innerChart
        innerChart = d3.select("#accom-swarm").select(".inner-chart");

        // Clear existing circles
        innerChart.selectAll(".circ")
            .transition()
                .duration(10000)
                .style("opacity", 0)
                .attr("cx", innerWidth/2);
                //.remove()
            //.on("end", () => {
        // Remove all circles after transition ends 
            //innerChart.selectAll(".circ").remove();
        //});
        
        innerChart.selectAll(".circ")
            .remove();
        
        // Clear existing axes
        innerChart.selectAll(".axis-y")
            .remove();

        // Clear existing tooltip
        innerChart.selectAll(".tooltip")
            .remove();
    }

    
    // Declare scales
    const maxAccomClaim = d3.max(data, d => d[value_field]);
    const yScale = d3.scaleLinear()
        .domain([0, maxAccomClaim])
        .range([innerHeight, 0])
        .nice();
    const colorScale = d3.scaleOrdinal()
        .domain(partyColours.map(s => s.name))
        .range(partyColours.map(s => s.color));
    
    // Append axes
    const leftAxis = d3.axisLeft(yScale);
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .call(leftAxis);
    
    let rsize = 4

    // If there are more than 25 MPs with a value of 0, filter them out
    if (data.filter(d => d[value_field] === 0).length > 25) {
        data = data.filter(d => d[value_field] > 0);
    }
    // Data binding
    innerChart
        .selectAll(".circ")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "grey")
        .attr("id", d => d["mp_id"])
        .attr("fill", d => colorScale(d["party"]))
        .attr("r", rsize)
        .attr("cx", innerWidth/2)
        .attr("cy", d => yScale(d[value_field]))
        .attr("opacity", 0.6);

    // Force simulation
    let simulation = d3.forceSimulation(data)
    
        .force("x", d3.forceX((d) => {
            return innerWidth/2;
            }).strength(1))
        
        .force("y", d3.forceY((d) => {
            return yScale(d[value_field]);
            }).strength(1))
        
        .force("collide", d3.forceCollide(rsize*2))
        
        .alphaDecay(0.05)
        .alpha(0.4)
        .on("tick", tick);
    
    // Run force sim
    function tick() {
        d3.selectAll(".circ")
            .attr("cx", (d) => d.x)
            // Best not to use this as can alter y position, giving false values
            // .attr("cy", (d) => d.y);
        }

    handleMouseEvents(data, value_field);
    //createTooltip(data);
    createSwarmTooltip(); // Create the tooltip for the swarm chart

    // Generate an array of numbers from 0 to 9999
    const allNumbers = Array.from({ length: 10000 }, (_, i) => i);

    // Call updateCircleOpacity with the array
    updateCircleOpacity(allNumbers);

};

const createSwarmTooltip = (data) => {
    const tooltipWidth = 100;
    const tooltipHeight = 100;

    const tooltip = innerChart //d3.select("#accom-swarm")
        .append("g")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .attr("transform", `translate(0,1000)`); // Start off-screen

    tooltip.append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", "#78b82a") // mintGreen
        .attr("fill-opacity", 0.75);

    const tooltipContent = tooltip.append("g")
        .attr("class", "tooltip-content");

    // Add an image inside the tooltip
    tooltipContent.append("image")
        .attr("class", "mp-image")
        .attr("xlink:href", "https://members-api.parliament.uk/api/Members/5330/Thumbnail")
        .attr("width", 50) // Set the width of the image
        .attr("height", 50) // Set the height of the image
        .attr("x", tooltipWidth / 2 - 25) // Center the image horizontally
        .attr("y", 10); // Position the image vertically

    // Add MP name below the image, so that it shrinks to fit the tooltip width
    tooltipContent.append("text")
        .attr("class", "mp-name")
        .attr("x", tooltipWidth / 2)
        .attr("y", 70)
        .text("MP Name")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 350);
    
    tooltipContent.append("text")
        .attr("class", "mp-value")
        .attr("x", tooltipWidth / 2)
        .attr("y", 90)
        .text("£0") // Placeholder
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", 275);
}

/*const createTooltip = (data) => {
    const tooltipWidth = 100;
    const tooltipHeight = 100;

    const tooltip = innerChart
        .append("g")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .attr("transform", `translate(0,1000)`); // Start off-screen

    tooltip
        .append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", mintGreen) //ochre)
        .attr("fill-opacity", 0.75);

    const tooltipContent = tooltip
        .append("g")
        .attr("class", "tooltip-content");

    // Add an image inside the tooltip
    tooltipContent
        .append("image")
        .attr("class", "mp-image")
        .attr("xlink:href", "https://members-api.parliament.uk/api/Members/5330/Thumbnail")
        .attr("width", 50) // Set the width of the image
        .attr("height", 50) // Set the height of the image
        .attr("x", tooltipWidth / 2 - 25) // Center the image horizontally
        .attr("y", 10); // Position the image vertically

    
    // Add MP name below the image, so that it shrinks to fit the tooltip width

    tooltipContent
        .append("text")
        .attr("class", "mp-name")
        .attr("x", tooltipWidth / 2)
        .attr("y", 70)
        .text("MP Name")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 500)
        //.fill(periwinkle)
        // Shrink to fit the tooltip width
        //.width(tooltipWidth - 10) // Leave some padding
        .style("white-space", "nowrap")
        .style("text-overflow", "ellipsis")
        .style("overflow", "hidden");
};
*/

// Call the function to create buttons
//();
