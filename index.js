// Expects numbers `1` or `2` as single argument.
// Runs `Example 1` or `Example 2`, as described in the readme.

const examples = [
`
  var marker_01 = '';
  class C {
    p = (marker_02 = '') ? (marker_03 = '') : (marker_04 = '');
    constructor() {
      marker_05 = '';
    }
  }
  var marker_07 = '';
`,
`
  var marker_01 = '';
  class A {}
  class B extends A {
    p = (marker_02 = '') ? (marker_03 = '') : (marker_04 = '');
    constructor() {
      marker_05 = '';
      super();
      marker_06 = '';
    }
  }
  var marker_07 = '';
`
];

let exampleChoice = Number(process.argv[2]);
exampleChoice = isNaN(exampleChoice) ? 1 : Math.max(1, Math.min(exampleChoice, examples.length));
const codeSnippet = examples[exampleChoice - 1];
console.log(`Running Example ${exampleChoice}`);
console.log(codeSnippet);

const eslint = require('eslint');
const babelEslint = require('babel-eslint');
const linter = new eslint.Linter();
const rule = {
  create: function(context) {
    var indentation = 0;
    function print(msg) {
      console.log(' '.repeat(indentation) + msg);
    }
    return {
      onCodePathStart(codePath) {
        print(`PATH_START ${codePath.id}`);
      },
      onCodePathEnd(codePath) {
        print(`PATH_END   ${codePath.id}`);
      },
      onCodePathSegmentStart(codePathSegment) {
        print(`SEGMENT_START ${codePathSegment.id}`);
      },
      onCodePathSegmentEnd(codePathSegment) {
        print(`SEGMENT_END   ${codePathSegment.id}`);
      },
      ['*'](node) {
        print(`NODE_START ${node.type} ${node.type === 'Identifier' ? node.name : ''}`);
        indentation++;
      },
      ['*:exit'](node) {
        indentation--;
        print(`NODE_END   ${node.type} ${node.type === 'Identifier' ? node.name : ''}`);
      }
    };
  }
};

const parsingResult = babelEslint.parseForESLint(codeSnippet);
const sourceCode = new eslint.SourceCode({ text: codeSnippet, ...parsingResult });
linter.defineRule('x', rule);
linter.verify(sourceCode, { rules: { x: ['error'] } }, 'filePath.js');

