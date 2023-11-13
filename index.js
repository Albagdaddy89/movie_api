const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose');

const { check, validationResult } = require('express-validator');


const app = express();

//cors
const cors = require('cors');
app.use(cors());
const Models = require('./models.js');
const Movie = Models.Movie;
const User = Models.User

// connect to Mongodb
mongoose.connect('mongodb://127.0.0.1:27017/cfDB');


// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// General logging middleware
app.use((req, res, next) => {
  console.log(`General Middleware: ${req.method} ${req.path}`);
  next();
});

// Use Morgan middleware to log HTTP requests
app.use(morgan('common'));

// Passport middleware
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});


// Serve static files from the 'public' directory
app.use(express.static('public'));


//Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movie.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
})

//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:Title',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await Movie.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error: ' + err);
    });


});

//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:genreName',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await Movie.find({ "Genre.Name": req.params.genreName })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error: ' + err);
    });


});
//Return data about a director (bio, birth year, death year) by name;
app.get('/movies/director/:directorName',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await Movie.find({ "Director.Name": req.params.directorName })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error: ' + err);
    });
})
// Get all users
app.get('/user', passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await User.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/user/:username',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  const username = req.params.username;
  console.log(`Looking for username: ${username}`); // Add logging

  try {
    const user = await User.findOne({ username: username }).exec();

    if (!user) {
      console.log('User not found');
      return res.status(404).send('User not found'); // Send 404 if not found
    }

    console.log(`Found user: ${user}`);
    res.status(200).json(user); // Send 200 for OK
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});
//Allow new users to register;
app.post('/user',[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()],
  async (req, res) => {
  let errrors = validationResult(req);

  if (!errrors.isEmpty()) {
    return res.status(422).json({ errrors: errrors.array() })
  }
  let hashPassword = User.hashPassword(req.body.password);
  await User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        User
          .create({
            username: req.body.username,
            email: req.body.email,
            birthday: req.body.birthday,
            password: req.body.password
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// Update a user's info, by username
app.put('/user/:username', passport.authenticate ('jwt', { session: false }), async (req, res) => {
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied!');
  }
  await User.findOneAndUpdate({ username: req.params.username }, {
    $set:
    {
      username: req.body.username,
      email: req.body.email,
      birthday: req.body.birthday,
      password: req.body.birthday
    }
  },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })

});

// Add a movie to a user's list of favorites
app.post('/user/:username/movies/:MovieID',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await User.findOneAndUpdate({ username: req.params.username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Remove a movie from a user's list of favorites
app.delete('/user/:username/movies/:MovieID',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  await User.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        res.status(400).send('User not found');
      } else {
        res.status(200).json(user);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



// Delete a user by username
app.delete('/user/:username',  passport.authenticate ('jwt', { session: false }), async (req, res) => {
  const usernameToDelete = req.params.username;
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied!');
  }
  console.log("Received DELETE request for username:", usernameToDelete);

  try {
    const user = await User.findOneAndDelete({ username: usernameToDelete });
    if (user) {
      console.log("Successfully deleted user:", usernameToDelete);
      res.status(200).send(usernameToDelete + ' was deleted.');
    } else {
      console.log("No user found with username:", usernameToDelete);
      res.status(404).send('User ' + usernameToDelete + ' was not found');
    }
  } catch (err) {
    console.error("Error during deletion:", err);
    res.status(500).send('Error: ' + err);
  }
});


// Error-handling middleware, must be defined after other app.use() and route calls
app.use((err, req, res, next) => {
  console.log(`Middleware: ${req.method} ${req.path}`);
  console.error(err.stack); // Log error message in the server's console
  res.status(500).send('Something broke!');
});

// Start the server and listen on the specified port
const port = 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});