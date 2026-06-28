const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace require with import
  content = content.replace(/const\s+([\w{}]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from \'$2\';');
  
  // Special case for dotenv
  content = content.replace(/require\(['"]dotenv['"]\)\.config\(\);/g, 'import * as dotenv from \'dotenv\';\ndotenv.config();');
  
  // Replace module.exports = ...
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_{}]+);/g, 'export default $1;');
  content = content.replace(/module\.exports\s*=\s*{([^}]+)};/g, 'export { $1 };');
  
  // Add implicit any to (req, res, next)
  content = content.replace(/req, res\)/g, 'req: any, res: any)');
  content = content.replace(/req, res, next\)/g, 'req: any, res: any, next: any)');
  content = content.replace(/\(req, res\s*=>/g, '(req: any, res: any) =>');
  content = content.replace(/async\s+\(req,\s*res\)\s*=>/g, 'async (req: any, res: any) =>');
  content = content.replace(/async\s+\(req,\s*res,\s*next\)\s*=>/g, 'async (req: any, res: any, next: any) =>');
  
  // (err, req, res, next)
  content = content.replace(/\(err,\s*req,\s*res,\s*next\)\s*=>/g, '(err: any, req: any, res: any, next: any) =>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Done!');
