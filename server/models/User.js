const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

class User extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Please provide a valid email' },
        notEmpty: { msg: 'Email is required' },
      },
      set(value) {
        if (value) this.setDataValue('email', value.trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 128],
          msg: 'Password must be at least 6 characters',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'superadmin'),
      defaultValue: 'admin',
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('id');
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
