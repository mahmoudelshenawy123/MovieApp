const mongoose = require('mongoose');

const MoviesSchema = mongoose.Schema(
  {
    title: {
      type: String,
      index: { unique: true },
      required: [true, 'Movie Title Is Required'],
    },
    director: {
      type: String,
    },
    year: {
      type: String,
    },
    country: {
      type: String,
    },
    length: {
      type: Number,
    },
    genre: {
      type: String,
    },
    colour: {
      type: String,
    },
    additional_info: [
      {
        info_type: {
          type: String,
        },
        info_value: {
          type: String,
        },
      },
    ],
    tmdb_additional_info: [
      {
        info_type: {
          type: String,
        },
        info_value: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

module.exports.Movies = mongoose.model('Movie', MoviesSchema);
