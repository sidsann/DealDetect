const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./Route');

const app = express();
app.use(cors({
    origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in Route.js
app.get('/top_rated_products', routes.top_rated_products);
app.get('/top_cheapest_products', routes.top_cheapest_products);
app.get('/top_expensive_products', routes.top_expensive_products);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;