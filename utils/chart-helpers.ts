/**
 * Helper functions for drawing simple charts directly with jsPDF
 * This is used as a fallback when canvas isn't available server-side
 */

import jsPDF from 'jspdf';

interface ChartData {
  labels: string[];
  values: number[];
  title: string;
}

/**
 * Draw a simple bar chart directly with jsPDF
 */
export function drawBarChart(doc: jsPDF, data: ChartData, x: number, y: number, width: number, height: number) {
  const { labels, values, title } = data;
  
  // Calculate max value for scaling
  const maxValue = Math.max(...values);
  
  // Calculate bar dimensions
  const barCount = values.length;
  const barWidth = width / (barCount * 2); // Leave space between bars
  const maxBarHeight = height - 30; // Leave space for labels
  
  // Draw title
  doc.setFontSize(12);
  doc.text(title, x, y);
  
  // Draw horizontal axis
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(x, y + maxBarHeight + 10, x + width, y + maxBarHeight + 10);
  
  // Draw vertical axis
  doc.line(x, y + maxBarHeight + 10, x, y);
  
  // Draw bars
  values.forEach((value, index) => {
    const barHeight = (value / maxValue) * maxBarHeight;
    const xPos = x + (index * barWidth * 2) + barWidth;
    const yPos = y + maxBarHeight + 10 - barHeight;
    
    // Draw bar
    doc.setFillColor(41, 128, 185);
    doc.rect(xPos, yPos, barWidth, barHeight, 'F');
    
    // Draw value
    doc.setFontSize(8);
    doc.text(String(value), xPos, yPos - 2);
    
    // Draw label
    const label = labels[index].substring(0, 7);
    doc.setFontSize(8);
    doc.text(label, xPos, y + maxBarHeight + 20, { angle: 45 });
  });
}

/**
 * Draw a simple pie chart representation with jsPDF
 */
export function drawPieChart(doc: jsPDF, data: ChartData, x: number, y: number, width: number, height: number) {
  const { labels, values, title } = data;
  
  // Calculate total for percentages
  const total = values.reduce((sum, value) => sum + value, 0);
  
  // Set colors for pie slices
  const colors = [
    [41, 128, 185],   // blue
    [231, 76, 60],    // red
    [241, 196, 15],   // yellow
    [46, 204, 113],   // green
    [155, 89, 182]    // purple
  ];
  
  // Draw title
  doc.setFontSize(12);
  doc.text(title, x, y);
  
  // Draw legend with colored boxes
  let legendY = y + 20;
  
  values.forEach((value, index) => {
    const percentage = Math.round((value / total) * 100);
    const label = labels[index].substring(0, 15);
    
    // Draw color box
    const color = colors[index % colors.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, legendY, 10, 10, 'F');
    
    // Draw label and percentage
    doc.setFontSize(10);
    doc.text(`${label}: ${percentage}%`, x + 15, legendY + 7);
    
    legendY += 15;
  });
}

/**
 * Create chart data from report data
 */
export function extractChartData(data: any, chart: any): ChartData {
  const labels = data.data.map((item: any) => item.department || item.name || '');
  
  const values = data.data.map((item: any) => {
    // Try to extract the most relevant value from the data item
    return item.revenue || item.successful || item.bedUtilization || 
           item.compliant || item.metric1 || Object.values(item)[1] || 0;
  });
  
  return {
    labels,
    values,
    title: chart.title
  };
}
