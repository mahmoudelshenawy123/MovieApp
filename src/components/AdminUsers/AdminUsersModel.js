const mongoose = require('mongoose');

const AdminUsersSchema = mongoose.Schema(
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
    api_token: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

module.exports.AdminUsers = mongoose.model('AdminUser', AdminUsersSchema);
