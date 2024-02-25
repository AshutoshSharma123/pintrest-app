const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  user: {
    type:mongoose.SchemaTypes.ObjectId,
    ref:'user'
  },
  title: String,
  description: String,
  password: String,
  image: String,

});

module.exports = mongoose.model('post', postSchema);
