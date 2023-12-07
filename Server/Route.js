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


const advancedSearch = async function (req, res) {
  const pageSize = 25;
  const page = req.query.page;
  const offset = (page - 1) * pageSize;


  const lowPrice = req.query.lPrice;
  const highPrice = req.query.hPrice;
  let wherePrice = "";

  if (lowPrice && highPrice) {
    wherePrice = `AND Price BETWEEN ${lowPrice} AND ${highPrice}`;
  } else if (lowPrice) {
    wherePrice = `AND Price >= ${lowPrice}`;
  } else if (highPrice) {
    wherePrice = `AND Price <= ${highPrice}`;
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

  const searchString = req.query.q;
  const orderDirection = ["ASC", "DESC"];
  const orderVariable = ["Title", "Price", "Platform", "URL", "Rating", "Sales"];
  const oDirection = req.query.od;
  const orderByVar = req.query.ov;
  const orderBy = `${oDirection && orderByVar ? orderVariable[orderByVar] + " " + orderDirection[oDirection]: ""}`;
  console.log("orderby=" + orderBy);
  const query = (`SELECT s.UID, s.Title, s.Price, s.Platform, URL.URL, SS.Rating, SS.Sales
        FROM ( 
            SELECT UID, Title, Price, Platform
            FROM Main
            WHERE MATCH(title) AGAINST("${searchString}")
            ${wherePrice}
        ) s
        LEFT JOIN URL ON s.UID = URL.UID
        ${whereRating || whereSales ? "": "LEFT "} JOIN (
            SELECT UID, Rating, Sales
            FROM Rating_Sales
            ${whereRating ? `WHERE ${whereRating}` : ""}
            ${whereRating && whereSales ? ` AND ${whereSales}` : ''}
            ${whereSales && !whereRating ? `WHERE ${whereSales}`: ""}
        ) SS ON s.UID = SS.UID
        ${orderBy ? `ORDER BY ${orderBy}` : ""}
        LIMIT ${pageSize}
        OFFSET ${offset};`).replace(/\n/g,"");

  console.log(query);

  connection.query(query,
      (err, data) => {
        if (err || data.length === 0) {
          console.error('Error or no data:', err);
          console.log("Raw data from SQL query:", data); // Before mapping
          res.json([]);
        } else {
          console.log("Raw data from SQL query:", data); // Before mapping

          const arr = data.map((product) => ({
            UID: product.UID,
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


//find average price across different platform 
const average_price = async function(req, res){
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
const random_product = async function (req, res) {
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
const count_product = async function (req, res) {
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
  average_price,
  random_product,
  count_product,
  advancedSearch,
  top_rated_products,
  top_cheapest_products,
  top_expensive_products
}
