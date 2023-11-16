const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const Movie = Models.Movie;
const User = Models.User;
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(morgan('common'));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//mongoose.connect('mongodb://127.0.0.1:27017/cfDB');
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});




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
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error: ' + err);
    });


});

//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/Genre/:GenreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movie.find({ "Genre.Name": req.params.GenreName });
    if (movies.length === 0) {
      res.status(404).send('Genre not found');
    } else {
      // Since all movies of the same genre will have the same description,
      // we can safely return the description from the first movie found
      res.status(200).json({ description: movies[0].Genre.Description });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
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
  check('username', 'username is required').isLength({min: 5}),
  check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'password is required').not().isEmpty(),
  check('email', 'email does not appear to be valid').isEmail()],
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
            password: hashPassword
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
app.put('/user/:username', 
  [
    check('username', 'Username is required').isLength({min: 5}),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Check if the password is provided and not empty
  if (!req.body.password || req.body.password.trim() === '') {
    return res.status(400).send("Password is required.");
  }

  let hashedPassword = User.hashPassword(req.body.password);

  await User.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      username: req.body.username,
      email: req.body.email,
      birthday: req.body.birthday,
      password: hashedPassword,
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
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

app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});