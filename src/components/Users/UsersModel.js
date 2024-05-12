const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User Name Is Required'],
    },
    email: {
      type: String,
      index: { unique: true },
      required: [true, 'User Email Is Required'],
    },
    password: {
      type: String,
      required: [true, 'User Password Is Required'],
    },
    favorites_movies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Movie',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

module.exports.Users = mongoose.model('User', UsersSchema);
