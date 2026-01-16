const path = require('path');

const express = require('express');

const test = './router';
// const test = require('./router');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// })

console.log(test);

app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`);
});