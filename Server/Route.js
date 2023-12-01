const mysql = require('mysql')
const config = require('./config.json')

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const top_rated_products = async function(req, res) {
  
    const page = req.query.page;
    const pageSize = req.query.page_size ? req.query.page_size : 10;
    const offset = pageSize * (page - 1);

      connection.query(`
      WITH topSellers as (SELECT *
        FROM Rating_Sales
        ORDER BY Rating Desc, Sales Desc
        LIMIT ${pageSize}
        OFFSET ${offset}
        )
        SELECT m.Title, m.Price, m.Platform, u.URL, topSellers.Rating, topSellers.Sales
        FROM topSellers
        JOIN Main m ON topSellers.UID=m.UID
        LEFT JOIN URL u ON topSellers.UID=u.UID;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

const top_cheapest_products = async function(req, res) {
  
    const page = req.query.page;
    const pageSize = req.query.page_size ? req.query.page_size : 10;
    const offset = pageSize * (page - 1);

      connection.query(`
      SELECT m.Title, m.Price, m.Platform, URL.URL, SS.Rating, SS.Sales
      FROM (
         SELECT *
         FROM Main
         ORDER BY price
         LIMIT ${pageSize}
         OFFSET ${offset}
          ) m
      left join URL on m.UID = URL.UID
      left join Rating_Sales SS on m.UID = SS.UID;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}
  

const top_expensive_products = async function(req, res) {
  
    const page = req.query.page;
    const pageSize = req.query.page_size ? req.query.page_size : 10;
    const offset = pageSize * (page - 1);

      connection.query(`
      SELECT m.Title, m.Price, m.Platform, URL.URL, SS.Rating, SS.Sales
      FROM (SELECT UID, Title, Price, Platform
           FROM Main
           ORDER BY price desc
           LIMIT ${pageSize} OFFSET ${offset}) m
              left join URL on m.UID = URL.UID
              left join Rating_Sales SS on m.UID = SS.UID;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}