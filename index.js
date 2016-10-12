const express = require('express');
const { instagram } = require('instagram-node');


const app = express();
const api = instagram();

api.use({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});


const redirectUri = request => `http://${ request.headers.host }/callback`;


app.get('/', (request, response) => {
  response.send('Hello, world!');
});

app.get('/auth', (request, response) => {
  response.redirect(api.get_authorization_url(redirectUri(request)));
});

app.get('/callback', (request, response) => {
  const { query } = request;

  if (query.error) {
    response.status(403).json({ error: query.error });
    return;
  }

  api.authorize_user(query.code, redirectUri(request), (error, result) => {
    if (error) {
      response.status(503).json({ error: error.body || 'Something wrong' });
    } else {
      response.json({ token: result.access_token });
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${ process.env.PORT }`); // eslint-disable-line
});
