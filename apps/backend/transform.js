const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const code = fs.readFileSync('src/index.js', 'utf8');

const ast = parser.parse(code, {
  sourceType: 'module',
});

let modifiedCount = 0;

traverse(ast, {
  CallExpression(path) {
    const callee = path.node.callee;
    
    // Match app.get, app.post, app.put, app.delete
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'app' }) &&
      ['get', 'post', 'put', 'delete'].includes(callee.property.name)
    ) {
      const args = path.node.arguments;
      const lastArgIndex = args.length - 1;
      const lastArg = args[lastArgIndex];

      // Match the async route handler arrow function
      if (
        t.isArrowFunctionExpression(lastArg) &&
        lastArg.async === true &&
        t.isBlockStatement(lastArg.body)
      ) {
        // Find if the block contains a TryStatement
        const bodyStatements = lastArg.body.body;
        
        // We only want to refactor if the try-catch is the primary structure
        // e.g. potentially with some simple checks before it.
        const tryStatementIndex = bodyStatements.findIndex(stmt => t.isTryStatement(stmt));
        
        if (tryStatementIndex !== -1) {
          const tryStmt = bodyStatements[tryStatementIndex];
          
          // Unpack the try block's contents into the main block
          const unwrappedBody = [
            ...bodyStatements.slice(0, tryStatementIndex),
            ...tryStmt.block.body,
            ...bodyStatements.slice(tryStatementIndex + 1)
          ];
          
          lastArg.body.body = unwrappedBody;
          
          // Wrap the entire async arrow function in asyncHandler()
          args[lastArgIndex] = t.callExpression(
            t.identifier('asyncHandler'),
            [lastArg]
          );
          
          modifiedCount++;
        }
      }
    }
  }
});

if (modifiedCount > 0) {
  // Add asyncHandler definition to the top (after requires)
  const output = generate(ast, {
    retainLines: false,
    compact: false,
    quotes: 'single',
  }, code);
  
  fs.writeFileSync('src/index.js', output.code);
  console.log(`Refactored ${modifiedCount} route handlers successfully.`);
} else {
  console.log('No routes matched the refactoring pattern.');
}
