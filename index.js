const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
uuid = require('uuid');
const mongoose = require('mongoose');
const { User, Movie} = require('./models.js');


mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });


// Create an instance of the express application
const app = express();

app.use(express.json())

// Define the port number
const port = 8080;

// Use Morgan middleware to log HTTP requests
app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));





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
app.get('/movies', async (req, res) => {
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
app.get('/movies/:Title', async (req, res) => {
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
app.get('/movies/genre/:genreName', async (req, res) => {
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
app.get('/movies/director/:directorName', async (req, res) => {
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
app.get('/user', async (req, res) => {
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
app.get('/user/:Username', async (req, res) => {
  const username = req.params.Username;
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
app.post('/user', async (req, res) => {
  await User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        User
          .create({
            username: req.body.username,
            email: req.body.email,
            birthday: req.body.birthday
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
app.put('/user/:Username', async (req, res) => {
  await User.findOneAndUpdate({ username: req.params.Username }, {
    $set:
    {
      username: req.body.username,
      email: req.body.email,
      birthday: req.body.birthday
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
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await User.findOneAndUpdate({ username: req.params.Username }, {
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
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  await User.findOneAndUpdate(
    { username: req.params.Username },
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

//Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/user/:id', async (req, res) => {
  
  await User.findOneAndDelete({ _id: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.id + ' was not found');
      } else {
        res.status(200).send(req.params.id + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });


  // Delete a user by username
  app.delete('/user/:Username', async (req, res) => {
    await User.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });