const express = require('express');

const app = express();

app.get('/', (request, response) => {
  response.send('Hello, world!');
});

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${ process.env.PORT }`);
});
