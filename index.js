const express = require('express');
const { instagram } = require('instagram-node');
const get = require('lodash.get');

const { version } = require('./package');


const app = express();
const api = instagram();

api.use({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
});


const redirectUri = request => `http://${ request.headers.host }/callback`;

const mappper = data => data.map(m => ({
  id: m.id,
  image: get(m, 'images.standard_resolution.url'),
  created_at: parseInt(m.created_time, 10),
  link: m.link,
  text: get(m, 'caption.text'),
  comments: get(m, 'comments.count', 0),
  likes: get(m, 'likes.count', 0),
}));


app.get('/', (request, response) => {
  api.user_self_media_recent({}, (error, data) => {
    if (error) {
      response.status(503).json({ error: error.body || 'Something wrong' });
    } else {
      response.json({ data: mappper(data) });
    }
  });
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

app.get('/info', (request, response) => response.json({ version }));

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${ process.env.PORT }`); // eslint-disable-line
});
