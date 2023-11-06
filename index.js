const express = require('express');
const morgan = require('morgan');

// Create an instance of the express application
const app = express();

// Define the port number
const port = 8080;

// Use Morgan middleware to log HTTP requests
app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define an array of top movies
let topMovies = [
    {
      "title": "The Hateful Eight",
      "director": "Quentin Tarantino",
      "releaseDate": "2015-12-25"
    },
    {
      "title": "Pulp Fiction",
      "director": "Quentin Tarantino",
      "releaseDate": "1994-10-14"
    },
    {
      "title": "Unbreakable",
      "director": "M. Night Shyamalan",
      "releaseDate": "2000-11-22"
    },
    {
      "title": "Snatch",
      "director": "Guy Ritchie",
      "releaseDate": "2000-09-01"
    },
    {
      "title": "The Dark Knight",
      "director": "Christopher Nolan",
      "releaseDate": "2008-07-18"
    },
    {
      "title": "Django Unchained",
      "director": "Quentin Tarantino",
      "releaseDate": "2012-12-25"
    },
    {
      "title": "The Godfather Part II",
      "director": "Francis Ford Coppola",
      "releaseDate": "1974-12-20"
    },
    {
      "title": "Goodfellas",
      "director": "Martin Scorsese",
      "releaseDate": "1990-09-19"
    },
    {
      "title": "The Lord of the Rings: The Fellowship of the Ring",
      "director": "Peter Jackson",
      "releaseDate": "2001-12-19"
    },
    {
      "title": "The Lord of the Rings: The Two Towers",
      "director": "Peter Jackson",
      "releaseDate": "2002-12-18"
    },
    {
      "title": "The Lord of the Rings: The Return of the King",
      "director": "Peter Jackson",
      "releaseDate": "2003-12-17"
    }
  ];

// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// Define the '/movies' route to serve the movies array as JSON
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Error-handling middleware, must be defined after other app.use() and route calls
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error message in the server's console
  res.status(500).send('Something broke!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
