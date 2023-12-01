const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

app.get('/top_rated_products', Routes.top_rated_products);
app.get('/top_cheapest_products', Routes.top_cheapest_products);
app.get('/top_expensive_products', Routes.top_expensive_products);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
