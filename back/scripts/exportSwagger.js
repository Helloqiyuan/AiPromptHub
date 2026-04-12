const fs = require('fs');
const path = require('path');

const swaggerSpec = require('../src/config/swagger');

const outputDir = path.resolve(__dirname, '../swagger');
const outputFile = path.join(outputDir, 'openapi.json');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(swaggerSpec, null, 2)}\n`, 'utf8');

console.log(`Swagger OpenAPI 已导出: ${outputFile}`);
