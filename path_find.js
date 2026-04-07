import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- PATH DIAGNOSTIC ---');
console.log('Current File:', __filename);
console.log('Current Dir:', __dirname);
console.log('--- END PATH ---');
