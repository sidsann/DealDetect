const mysql = require('mysql')
const config = require('./config.json')

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => {if(err) {console.log(err);} else{ console.log("success");}});

//Route 1 for regular search function /search/:type
const regSearch = async function (req, res) {
  const pageSize = 25;
  const page = req.query.page;
  const offset = (page - 1) * pageSize;
  const query = req.query.q;

  connection.query(
      `WITH search AS (
        SELECT *
        FROM Main
        WHERE MATCH(title) AGAINST("${query}")
       )
SELECT s.Title, s.Price, s.Platform, URL.URL, SS.Rating, SS.Sales, k.Keywords
FROM search s
LEFT JOIN URL ON s.UID = URL.UID
LEFT JOIN Rating_Sales SS ON s.UID = SS.UID
LEFT JOIN Keywords k ON s.UID = k.UID
LIMIT ${pageSize}
OFFSET ${offset};
`,
      (err, data) => {
        if (err || data.length === 0) {
          console.error('Error or no data:', err);
          res.json([]);
        } else {
          console.log("Raw data from SQL query:", data); // Before mapping

          const arr = data.map((product) => ({
            Title: product.Title,
            Price: product.Price,
            Platform: product.Platform,
            URL: product.URL,
            Rating: product.Rating,
            Sales: product.Sales,
          }));

          console.log("Data after mapping:", arr); // After mapping
          res.json(arr);
        }
      }
  );
}

//Route 2 for advanced search function
const advancedSearch = async function (req, res) {
  const pageSize = 25;
  const page = req.query.page;
  const offset = (page - 1) * pageSize;


  const lowPrice = req.query.lPrice;
  const highPrice = req.query.hPrice;
  let wherePrice = "";

  if (lowPrice && highPrice) {
    wherePrice = `WHERE Price BETWEEN ${lowPrice} AND ${highPrice}`;
  } else if (lowPrice) {
    wherePrice = `WHERE Price >= ${lowPrice}`;
  } else if (highPrice) {
    wherePrice = `WHERE Price <= ${highPrice}`;
  }

  const lowRating = req.query.lRating;
  const highRating = req.query.hRating;
  let whereRating = "";

  if (lowRating && highRating) {
    whereRating = `Rating BETWEEN ${lowRating} AND ${highRating}`;
  } else if (lowRating) {
    whereRating = `Rating >= ${lowRating}`;
  } else if (highRating) {
    whereRating = `Rating <= ${highRating}`;
  }

  const lowSales = req.query.lSales;
  const highSales = req.query.hSales;
  let whereSales = "";

  if (lowSales && highSales) {
    whereSales = `Sales BETWEEN ${lowSales} AND ${highSales}`;
  } else if (lowSales) {
    whereSales = `Sales >= ${lowSales}`;
  } else if (highSales) {
    whereSales = `Sales <= ${highSales}`;
  }

  const searchString = req.query.kw;

  const orderDirection = ["ASC", "DESC"];
  const orderVariable = ["Title", "Price", "Platform", "URL", "Rating", "Sales"];
  const oDirection = req.query.oD;
  const orderByVar = req.query.oV;
  const orderBy = `${orderVariable[orderByVar] + " " + orderDirection[oDirection]}`
  connection.query(
      `SELECT s.Title, s.Price, s.Platform, URL.URL, SS.Rating, SS.Sales
        FROM (
            SELECT UID, Title, Price, Platform
            FROM Main
            ${wherePrice}
        ) s
        LEFT JOIN URL ON s.UID = URL.UID
        LEFT JOIN (
            SELECT UID, Rating, Sales
            FROM Rating_Sales
            ${whereRating ? `WHERE ${whereRating}` : ""}
            ${whereRating && whereSales ? ` AND ${whereSales}` : ''}
            ${whereSales && !whereRating ? `WHERE ${whereSales}`: ""}
        ) SS ON s.UID = SS.UID
        ${searchString ? `LEFT JOIN (
            SELECT UID
            FROM Keywords
            WHERE MATCH(keywords) AGAINST("${searchString}")
        ) k ON s.UID = k.UID` : ""}
        ORDER BY ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${offset};`,
      (err, data) => {
        if (err || data.length === 0) {
          console.error('Error or no data:', err);
          res.json([]);
        } else {
          console.log("Raw data from SQL query:", data); // Before mapping

          const arr = data.map((product) => ({
            Title: product.Title,
            Price: product.Price,
            Platform: product.Platform,
            URL: product.URL,
            Rating: product.Rating,
            Sales: product.Sales,
          }));

          console.log("Data after mapping:", arr); // After mapping
          res.json(arr);
        }
      }
  )
}

module.exports = {
  regSearch,
  advancedSearch
};