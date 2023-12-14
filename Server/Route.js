const mysql = require('mysql')
const config = require('./config.json')

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});

connection.connect((err) => { if (err) { console.log(err); } else { console.log("success"); } });

  const advancedSearch = async function (req, res) {
    const pageSize = 25;
    const page = parseInt(req.query.page) || 1;
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
    const orderBy = `${oDirection && orderByVar ? orderVariable[orderByVar] + " " + orderDirection[oDirection] : ""}`;
    console.log("orderby=" + orderBy);
    const query = (`SELECT s.UID, s.Title, s.Price, s.Platform, URL.URL, SS.Rating, SS.Sales
        FROM ( 
            SELECT UID, Title, Price, Platform
            FROM Main
            WHERE MATCH(title) AGAINST("${searchString}")
            ${wherePrice}
        ) s
        LEFT JOIN URL ON s.UID = URL.UID
        ${whereRating || whereSales ? "" : "LEFT "} JOIN (
            SELECT UID, Rating, Sales
            FROM Rating_Sales
            ${whereRating ? `WHERE ${whereRating}` : ""}
            ${whereRating && whereSales ? ` AND ${whereSales}` : ''}
            ${whereSales && !whereRating ? `WHERE ${whereSales}` : ""}
        ) SS ON s.UID = SS.UID
        ${orderBy ? `ORDER BY ${orderBy}` : ""}
        LIMIT ${pageSize}
        OFFSET ${offset};`).replace(/\n/g, "");


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
          connection.query('DELETE FROM AdvancedSearchResults', (deleteErr) => {
            if (deleteErr) {
              console.error('Error deleting old data:', deleteErr);
              res.json([]);
              return;
            }

            // Then insert new data
            const insertQuery = `INSERT INTO AdvancedSearchResults (UID, Title, Price, Platform, URL, Rating, Sales) VALUES ?`;
            const values = data.map(item => [item.UID, item.Title, item.Price, item.Platform, item.URL, item.Rating, item.Sales]);

            connection.query(insertQuery, [values], (insertErr) => {
              if (insertErr) {
                console.error('Error inserting new data:', insertErr);
                res.json([]);
                return;
              }
              console.log("Data inserted into AdvancedSearchResults");
            });
          });
          
          // const insertQuery = `INSERT INTO AdvancedSearchResults (UID, Title, Price, Platform, URL, Rating, Sales) VALUES ?`;
          // const values = data.map(item => [item.UID, item.Title, item.Price, item.Platform, item.URL, item.Rating, item.Sales]);
          // connection.query(insertQuery, [values], (err) => {
          //   if (err) console.log(err);
          //   else console.log("Data inserted into AdvancedSearchResults");
          // });
          
        }
      }
    )
  }


//find average price across different platform 
const average_price = async function (req, res) {
  connection.query(`
  Select Platform, AVG(Price) as Average
  FROM AdvancedSearchResults
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
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
    SELECT COUNT(*) AS ProductCount
    FROM AdvancedSearchResults;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const top_rated_products = async function (req, res) {

  connection.query(`
    SELECT Title
    FROM AdvancedSearchResults
    ORDER BY Rating DESC
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


const top_cheapest_products = async function (req, res) {

  connection.query(`
    SELECT Title
    FROM AdvancedSearchResults
    ORDER BY Price
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


const top_expensive_products = async function (req, res) {

  connection.query(`
      SELECT Title
    FROM AdvancedSearchResults
    ORDER BY Price DESC
    LIMIT 1
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const get_favorites = async function (req, res) {
  const pageSize = 25;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;
  const query = "SELECT f.UID, m.Title, m.Price, m.Platform, u.URL, r.Rating, r.Sales, f.date_added" +
      " FROM Favorites f JOIN Main m ON f.UID=m.UID JOIN URL u ON u.uid=f.UID" +
      " JOIN Rating_Sales r ON r.UID=f.UID" +
      " ORDER BY date_added DESC" +
      ` LIMIT ${pageSize}` +
      ` OFFSET ${offset}`
  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      //res.json(data);
      const arr = data.map((product) => ({
        UID: product.UID,
        Title: product.Title,
        Price: product.Price,
        Platform: product.Platform,
        URL: product.URL,
        Rating: product.Rating,
        Sales: product.Sales,
        date_added: product.date_added,
      }));
      console.log("Data after mapping:", arr); // After mapping
      res.json(arr);
    }
  });
}
const add_favorite = async function (req) {
  const uid = req.query.uid;
  const query = `INSERT INTO Favorites (UID) VALUES ("${uid}");`;

  connection.query(query, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
    }
  });
}

const delete_favorite = async function (req, res) {
  const uid = req.query.uid;
  const query = `DELETE FROM Favorites WHERE UID = "${uid}";`;

  connection.query(query, (err, results) => {
    if (err) {
      // Log the error and send an error response
      console.error(err);
      res.status(500).send({ success: false, message: 'Error deleting favorite' });
    } else {
      // Check if any rows were affected
      if (results.affectedRows > 0) {
        res.send({ success: true, message: 'Favorite deleted successfully' });
      } else {
        res.status(404).send({ success: false, message: 'Favorite not found' });
      }
    }
  });
};


module.exports = {
  average_price,
  random_product,
  count_product,
  advancedSearch,
  top_rated_products,
  top_cheapest_products,
  top_expensive_products,
  get_favorites,
  add_favorite,
  delete_favorite
}