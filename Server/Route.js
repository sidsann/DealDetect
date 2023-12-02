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

//find average price across different platform 
const averagePrice = async function(req, res){
  connection.query(`
  Select Platform, AVG(Price) as Average
  FROM Search_output
  GROUP BY Platform
  `,(err, data) => {
    if(err){
      console.log(err);
      res.json([]);
    }else{
      res.json(data);
    }
  });
}

//find a random product across all platforms
const randomProd = async function (req, res) {
  connection.query(`
  WITH joined as (SELECT m.Title, m.Price, m.Platform, URL.URL, SS.Rating, SS.Sales, k.Keywords
                  FROM Main m
                  left join URL on m.UID = URL.UID
                  left join Rating_Sales SS on m.UID = SS.UID
                  left join Keywords k on m.UID = k.UID)
  SELECT *
  FROM joined
  ORDER BY RAND()
  LIMIT 20
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  })
}

//get the count of products in each rating category in user’s search results
const countProduct = async function (req, res) {
  connection.query(`
  SELECT
	CASE
		WHEN Rating BETWEEN 0 AND 1 THEN ‘0-1’
		WHEN Rating BETWEEN 1 AND 2 THEN ‘1-2’
		WHEN Rating BETWEEN 2 AND 3 THEN ‘2-3’
		WHEN Rating BETWEEN 3 AND 4 THEN ‘4-5’
		ELSE ‘4-5’
	END AS RatingCategory,
	COUNT(*) AS ProductCount
  FROM Rating_Sales
  WHERE UID IN (SELECT UID FROM UserSearchResults)
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  })
}

module.exports = {
  averagePrice,
  randomProd,
  countProduct,
}