/**
 * Parses and cleans an AI diagnosis response
 * Handles markdown formatting and removes any unnecessary elements
 */
export function parseAIResponse(response: string): string {
  if (!response) return '';
  
  // Remove thinking blocks if present
  let parsedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  // Trim any excessive whitespace
  parsedResponse = parsedResponse.trim();
  
  // Make sure headers are properly formatted
  parsedResponse = parsedResponse.replace(/##\s+/g, '## ');
  parsedResponse = parsedResponse.replace(/\n---\n/g, '\n\n---\n\n');
  
  // Ensure proper spacing around lists
  parsedResponse = parsedResponse.replace(/\n(\d+\.)/g, '\n\n$1');
  
  // Fix any potential ICD-10 codes (prevent them from being interpreted as markdown)
  parsedResponse = parsedResponse.replace(/I(\d+\.\d+)/g, 'I$1');
  
  return parsedResponse;
}

/**
 * Formats markdown for display in the UI
 * Returns an array of formatted sections
 */
export function formatDiagnosisForDisplay(markdown: string): { title: string; content: string }[] {
  if (!markdown) return [];
  
  // Split the markdown by sections (## headers)
  const sections = markdown.split(/(?=## )/);
  
  return sections
    .filter(section => section.trim())
    .map(section => {
      // Extract section title and content
      const titleMatch = section.match(/## ([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Diagnosis';
      
      // Remove the title from the content
      let content = titleMatch ? section.replace(/## [^\n]+/, '').trim() : section.trim();
      
      return { title, content };
    });
} 