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
app.get('/search', routes.regSearch);
app.get('/advSearch', routes.advancedSearch)

app.get('/avrage_price', avrage_price);
app.get('/random_product', routes.random_product);
app.get('/count_product', routes.count_product);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;

