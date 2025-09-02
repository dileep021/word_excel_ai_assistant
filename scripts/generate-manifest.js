const fs = require('fs');
const path = require('path');
require('dotenv').config();

const templatePath = path.join(__dirname, '../manifest.template.xml');
const outputPath = path.join(__dirname, '../manifest.xml');

try {
  let template = fs.readFileSync(templatePath, 'utf8');
  
  const hostname = process.env.HOSTNAME || 'localhost';
  const clientPort = process.env.CLIENT_PORT || '55030';
  
  template = template.replace(/__HOSTNAME__/g, hostname);
  template = template.replace(/__CLIENT_PORT__/g, clientPort);
  
  fs.writeFileSync(outputPath, template);
  
  console.log(`✓ Generated manifest.xml with ${hostname}:${clientPort}`);
} catch (error) {
  console.error('Failed to generate manifest:', error.message);
  process.exit(1);
}