/* ==========================================================================
   SIMPLE PROJECT CORRECTNESS TESTS
   No testing framework used on purpose — plain Node.js, so this stays
   easy to read and explain. Each check either passes or fails, and if
   any check fails, the script exits with code 1, which tells GitHub
   Actions that the CI run has failed.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

let allTestsPassed = true;

function check(description, condition) {
  if (condition) {
    console.log('PASS - ' + description);
  } else {
    console.log('FAIL - ' + description);
    allTestsPassed = false;
  }
}

console.log('Running Library Management System tests...\n');

const indexPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const jsPath = path.join(__dirname, '..', 'js', 'app.js');

check('index.html exists', fs.existsSync(indexPath));
check('css/style.css exists', fs.existsSync(cssPath));
check('js/app.js exists', fs.existsSync(jsPath));

if (fs.existsSync(jsPath)) {
  const appCode = fs.readFileSync(jsPath, 'utf8');

  const requiredFunctions = [
    'loadBooks',
    'saveBooks',
    'addBook',
    'updateBook',
    'deleteBook',
    'issueBook',
    'returnBook',
    'renderBooks',
    'updateDashboard',
    'getFilteredBooks'
  ];

  requiredFunctions.forEach(function (functionName) {
    check('app.js defines ' + functionName + '()', appCode.includes(functionName));
  });
}

if (fs.existsSync(indexPath)) {
  const htmlCode = fs.readFileSync(indexPath, 'utf8');

  check('index.html links css/style.css', htmlCode.includes('css/style.css'));
  check('index.html links js/app.js', htmlCode.includes('js/app.js'));
}

console.log('');

if (allTestsPassed) {
  console.log('All tests passed.');
  process.exit(0);
} else {
  console.log('Some tests failed. See FAIL lines above.');
  process.exit(1);
}