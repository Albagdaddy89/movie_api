const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
      Name: String,
      Description: String
    },
    Director: {
      Name: String,
      Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
  });
  
  let userSchema = mongoose.Schema({
    username: { type: String, required: true }, 
    email: { type: String, required: true }, 
    favoriteMovie: [{ type: String }],
    birthday: Date,
    password: { type: String, required: true }
    
  });

  userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  }

  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  

  let Movie = mongoose.model('Movie', movieSchema);
  let User = mongoose.model('User', userSchema);
  
  module.exports.Movie = Movie;
  module.exports.User = User;

