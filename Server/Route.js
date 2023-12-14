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

    
    // const checkTableQuery = "SHOW TABLES LIKE 'search_output'";
    // connection.query(checkTableQuery, async (err, result) => {
    //   if (err) {
    //     console.error('Error checking table existence:', err);
    //     res.status(500).json({ error: 'Internal Server Error' });
    //     return;
    //   }

    //   // If the table exists, delete all its contents
    //   if (result.length > 0) {
    //     const deleteTableQuery = "DELETE FROM search_output";
    //     await connection.query(deleteTableQuery, (err) => {
    //       if (err) {
    //         console.error('Error deleting table contents:', err);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //         return;
    //       }
    //       console.log('Deleted contents of search_output table');
    //     });
    //   } else {
    //     // If the table does not exist, create a new one
    //     const createTableQuery = `
    //     CREATE TABLE search_output (
    //       UID INT PRIMARY KEY,
    //       Title VARCHAR(255),
    //       Price DECIMAL(10, 2),
    //       Platform VARCHAR(255),
    //       URL VARCHAR(255),
    //       Rating DECIMAL(3, 2),
    //       Sales INT
    //     )
    //   `;
    //     await connection.query(createTableQuery, (err) => {
    //       if (err) {
    //         console.error('Error creating search_output table:', err);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //         return;
    //       }
    //       console.log('Created search_output table');
    //     });
    //   }
    //   const selectQuery = `SELECT s.UID, s.Title, s.Price, s.Platform, URL.URL, SS.Rating, SS.Sales
    //                  FROM ( 
    //                    SELECT UID, Title, Price, Platform
    //                    FROM Main
    //                    WHERE MATCH(title) AGAINST("${searchString}")
    //                    ${wherePrice}
    //                  ) s
    //                  LEFT JOIN URL ON s.UID = URL.UID
    //                  ${whereRating || whereSales ? "" : "LEFT "} JOIN (
    //                    SELECT UID, Rating, Sales
    //                    FROM Rating_Sales
    //                    ${whereRating ? `WHERE ${whereRating}` : ""}
    //                    ${whereRating && whereSales ? ` AND ${whereSales}` : ''}
    //                    ${whereSales && !whereRating ? `WHERE ${whereSales}` : ""}
    //                  ) SS ON s.UID = SS.UID
    //                  ${orderBy ? `ORDER BY ${orderBy}` : ""}`;

    //   const insertQuery = `
    //   INSERT INTO search_output (UID, Title, Price, Platform, URL, Rating, Sales)
    //   ${selectQuery}
    //   ON DUPLICATE KEY UPDATE UID = VALUES(UID);`;
      
    //   connection.query(insertQuery, (insertErr, insertResults) => {
    //     if (insertErr) {
    //       console.error("Error inserting into search_output table:", insertErr);
    //     } else {
    //       console.log("Successfully inserted data into search_output table.");
    //       console.log('insertquery', insertResults);
    //     }
    //   });

    // });



    // const checkAndCreateTable = async () => {
    //   const checkTableQuery = "SHOW TABLES LIKE 'search_output'";
    //   const createTableQuery = `
    //   CREATE TABLE IF NOT EXISTS search_output (
    //     UID INT PRIMARY KEY,
    //     Title VARCHAR(255),
    //     Price DECIMAL(10, 2),
    //     Platform VARCHAR(255),
    //     URL VARCHAR(255),
    //     Rating DECIMAL(3, 2),
    //     Sales INT
    //   );`;

    //   try {
    //     await connection.query(checkTableQuery);
    //     await connection.query(createTableQuery);
    //   } catch (err) {
    //     console.error('Error in checkAndCreateTable:', err);
    //     throw err;
    //   }
    // };

    // try {
    //   await checkAndCreateTable();

    //   // Clear the search_output table
    //   //await connection.query("TRUNCATE TABLE search_output");

    //   // Perform the search and insert results into search_output
    //   const data = await connection.query(query);

    //   if (data.length === 0) {
    //     console.log("No data found");
    //     res.json([]);
    //   } else {
    //     const insertQuery = "INSERT INTO search_output (UID, Title, Price, Platform, URL, Rating, Sales) VALUES ?";
    //     const insertValues = data.map(item => [item.UID, item.Title, item.Price, item.Platform, item.URL, item.Rating, item.Sales]);

    //     await connection.query(insertQuery, [insertValues]);

    //     console.log("Data inserted into search_output");
    //     res.json(data.map(product => ({
    //       UID: product.UID,
    //       Title: product.Title,
    //       Price: product.Price,
    //       Platform: product.Platform,
    //       URL: product.URL,
    //       Rating: product.Rating,
    //       Sales: product.Sales,
    //     })));
    //   }
    // } catch (err) {
    //   console.error('Error in advancedSearch:', err);
    //   res.status(500).json({ error: 'Internal Server Error' });
    // }

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

module.exports = {
  average_price,
  random_product,
  count_product,
  advancedSearch,
  top_rated_products,
  top_cheapest_products,
  top_expensive_products
}