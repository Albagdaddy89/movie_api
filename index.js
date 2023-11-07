const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
uuid = require('uuid');



// Create an instance of the express application
const app = express();

app.use(express.json())

// Define the port number
const port = 8080;

// Use Morgan middleware to log HTTP requests
app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Users

let users = [
  {
      id: 1,
      name: 'Billy',
      favoriteMovies: ['Pulp Fiction']
  },
  {
      id: 2,
      name: 'BOB',
      favoriteMovies: []
  }
]

// Define an array of movies
let movies = [
  {
    title: "The Hateful Eight",
    year: "2015",
    genre: {
      genreName: "Western",
      description: "Western films are a genre of movies that embody the spirit of the wild west and the grit of the American frontier."
    },
    director: {
      directorName: "Quentin Tarantino",
      birth: "1963"
    }
  },
  {
    title: "Pulp Fiction",
    year: "1994",
    genre: {
      genreName: "Crime",
      description: "Crime films are a genre that focus on the lives of criminals, the crimes they commit, and the repercussions of these actions."
    },
    director: {
      directorName: "Quentin Tarantino",
      birth: "1963"
    }
  },
  {
    title: "Unbreakable",
    year: "2000",
    genre: {
      genreName: "Superhero",
      description: "Superhero films are based on superhero comics, featuring characters with superhuman abilities and often complex moral dilemmas."
    },
    director: {
      directorName: "M. Night Shyamalan",
      birth: "1970"
    }
  },
  {
    title: "Snatch",
    year: "2000",
    genre: {
      genreName: "Crime Comedy",
      description: "Crime comedies combine elements of humor with a criminal plot, often featuring criminals in quirky, improbable situations."
    },
    director: {
      directorName: "Guy Ritchie",
      birth: "1968"
    }
  },
  {
    title: "The Dark Knight",
    year: "2008",
    genre: {
      genreName: "Superhero",
      description: "Superhero films are based on superhero comics, featuring characters with superhuman abilities and often complex moral dilemmas."
    },
    director: {
      directorName: "Christopher Nolan",
      birth: "1970"
    }
  },
  {
    title: "Django Unchained",
    year: "2012",
    genre: {
      genreName: "Western",
      description: "Western films are a genre of movies that embody the spirit of the wild west and the grit of the American frontier."
    },
    director: {
      directorName: "Quentin Tarantino",
      birth: "1963"
    }
  },
  {
    title: "The Godfather Part II",
    year: "1974",
    genre: {
      genreName: "Crime Drama",
      description: "Crime dramas focus on the moral dilemmas and organized crime figures, often featuring complex characters and intricate plots."
    },
    director: {
      directorName: "Francis Ford Coppola",
      birth: "1939"
    }
  },
  {
    title: "Goodfellas",
    year: "1990",
    genre: {
      genreName: "Crime Drama",
      description: "Crime dramas focus on the moral dilemmas and organized crime figures, often featuring complex characters and intricate plots."
    },
    director: {
      directorName: "Martin Scorsese",
      birth: "1942"
    }
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: "2001",
    genre: {
      genreName: "Fantasy",
      description: "Fantasy films are characterized by their imaginative and fantastical themes, often involving magic, mythical beings, and exotic fantasy worlds."
    },
    director: {
      directorName: "Peter Jackson",
      birth: "1961"
    }
  },
  {
    title: "The Lord of the Rings: The Two Towers",
    year: "2002",
    genre: {
      genreName: "Fantasy",
      description: "Fantasy films are characterized by their imaginative and fantastical themes, often involving magic, mythical beings, and exotic fantasy worlds."
    },
    director: {
      directorName: "Peter Jackson",
      birth: "1961"
    }
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: "2003",
    genre: {
      genreName: "Fantasy",
      description: "Fantasy films are characterized by their imaginative and fantastical themes, often involving magic, mythical beings, and exotic fantasy worlds."
    },
    director: {
      directorName: "Peter Jackson",
      birth: "1961"
    }
  }
];


// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
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

//Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send('no such movie');
  }
})

//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const moviesByGenre = movies.filter(movie => movie.genre.genreName.toLowerCase() === genreName.toLowerCase());

  if (moviesByGenre.length > 0) {
    res.status(200).json(moviesByGenre);
  } else {
    res.status(404).send('no such genre');
  }
})

//Return data about a director (bio, birth year, death year) by name;
app.get('/movies/director/:directorName', (req, res) => {
  const {directorName} = req.params;
  const directorInfo = movies.find(movie => movie.director.directorName.toLowerCase() === directorName.replace(/%20/g, " ").toLowerCase());

  if (directorInfo) {
    res.status(200).json(directorInfo.director);
  } else {
    res.status(404).send('no such director');
  }
})

//Allow new users to register;
app.post('/users',(req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4(); 
    users.push(newUser);
    res.status(201).json(newUser) 
  }else {
    res.status(400).send('Users need names')
  }
} );

//Allow users to update their user info (username);
app.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updatedUser = req.body;
  let user = users.find( user => user.id == id );
  if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
  } else {
      res.status(400).send('There is no such user')
  }
})

//Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:movieTitle', (req, res) => {
  const {id} = req.params;
  const movieTitle = req.params.movieTitle;

  let user = users.find( user => user.id == id );


  if (user) {
      user.favoriteMovies.push(movieTitle);
      res.status(200).send(movieTitle + ' has been added to user ' + id + '\'s array');
  } else {
      res.status(400).send('There is no such user')
  }
})

//Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
app.delete('/users/:id/:movieTitle', (req, res) => {
  const id = req.params.id;
  const movieTitle = req.params.movieTitle;

  let user = users.find( user => user.id == id );


  if (user) {
      user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
      res.status(200).send(movieTitle + ' has been removed from user ' + id + '\'s array.');
  } else {
      res.status(400).send('There is no such user')
  }
})

//Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  let user = users.find( user => user.id == id );


  if (user) {
      users = users.filter( user => user.id != id);
      res.status(200).send('User ' + id + ' has been deleted.');
  } else {
      res.status(400).send('There is no such user')
  }
})
