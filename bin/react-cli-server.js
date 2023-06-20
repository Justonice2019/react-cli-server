#!/usr/bin/env node
const execa = require('execa')
const args = process.argv.slice(2);
const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'start'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
switch(script) {
  case 'build':
  case 'start': {
    execa(
        'node',
        nodeArgs
            .concat(require.resolve(`../scripts/${script}`))
            .concat(args.slice(scriptIndex + 1)),
        {
          stdio: 'inherit'
        }
    );
    break;
  }
  default:
    console.log(`Unknown script "${script}".`);
    break;
}
