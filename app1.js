const express = require('express');
const app = express();
const port = 4000;
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const { name } = require('ejs');


//Establishing connection with database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ranees',
  database: 'employe',
});

// checked connect to MySQL or not
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ', connection.threadId);
});

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cookieParser());

//this get method is used to display the employee details
app.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const darkMode = req.cookies.darkMode === 'true';
  const query = `SELECT * FROM elist LIMIT ?, ?`; //this query is for selecting the 10 rows
  connection.query(query, [offset, limit], (err, results) => {
    if (err) {
      console.error('Error fetching data: ', err);
      res.status(500).send('Error fetching data');
      return;
    }

    connection.query('SELECT COUNT(*) AS count FROM elist', (err, countResults) => { //how many rows are there in the table elist
      if (err) {
        console.error('Error counting rows: ', err);
        res.status(500).send('Error counting rows');
        return;
      }
      const totalRows = countResults[0].count;
      const totalPages = Math.ceil(totalRows / limit); //each page contain only 10 rows so calculating how many pages are needed

      res.render('employeelist', {
        //passing these values for for loop creation
        rows: results,
        currentPage: page,
        totalPages: totalPages,
        darkMode: darkMode,
      });
    });
  });
});

// getting the addemployee pages
app.get('/addemploye', (req, res) => {
  const darkMode = req.cookies.darkMode === 'true';
  res.render('addemploye', { darkMode: darkMode });
});

//taking  the input for the corresponding text field
app.post('/addemploye', (req, res) => {
  const { name, phone, position, place } = req.body;
  const checkQuery = 'SELECT 1 FROM elist WHERE phone = ?'; //query is used to check the given phone number is already exist or not
  connection.query(checkQuery, [phone], (err, results) => {
    if (err) {
      return res.status(500).send('Error checking phone number existence');
    }

    if (results.length > 0) {
     
      return res.status(400).send('Phone number already present');
    }
 
  const query = `INSERT INTO elist (name, phone, position, place) values (?, ?, ?, ?)`; // query for inserting the datas into elist table
  const values = [name, phone, position, place];
  connection.query(query, values, ( results) => {
    res.redirect('/'); //after completion go back to the table page
  
  });
});
});

//searching for a row by using the id
app.get('/searchemploye', (req, res) => {
  const { id} = req.query;
  
  

    // Query by id
    if(isNaN(id)== false){
    const query = 'SELECT * FROM elist WHERE id = ?';
    connection.query(query, [id], (err, rows) => {
    

      if (rows.length > 0) {
        return res.render('searched', { row: rows[0] });
      } else {
        return res.status(404).send('Employee not found');
      }
    });
    //query search by name
  }else{
    const query = 'SELECT * FROM elist WHERE name = ?';
    connection.query(query, [id], (err, rows) => {
    

      if (rows.length > 0) {
        return res.render('searched', { row: rows[0] });
      } else {
        return res.status(404).send('Employee not found');
      }
    });

  }
   
});
  

app.post('/deleteemploye', (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM elist WHERE id = ?';
  connection.query(query, [id], (results) => {
    res.redirect('/');
  });
});

app.get('/editemploye', (req, res) => {
  const { id } = req.query;
  connection.query('SELECT * FROM elist WHERE id = ?', [id], (err, rows) => {
    if (rows.length > 0) {
      res.render('editemploye', { row: rows[0] });
    } else {
      res.status(404).send('Employee not found');
    }
  });
});

app.post('/editemploye', (req, res) => {
  const { id, name, phone, position, place } = req.body;
  //checking anyonne have the same phone number

  connection.query(
    'UPDATE elist SET name = ?, phone = ?, position = ?, place = ? WHERE id = ?',
    [name, phone, position, place, id],
    ( results) => {
      res.redirect('/');
    }
  );
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
