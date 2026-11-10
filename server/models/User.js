const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

class User extends Model {
  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    if (this.password === enteredPassword) return true;
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch (_) {
      return false;
    }
  }

  toJSON() {
    const values = { ...this.get() };
    const effectiveId = values.id || values.user_id;
    values._id = effectiveId;
    values.id = effectiveId;
    values.user_id = effectiveId;
    if (typeof values.permissions === 'string') {
      try {
        values.permissions = JSON.parse(values.permissions);
      } catch (_) {
        values.permissions = [values.permissions];
      }
    } else if (!values.permissions) {
      values.permissions = values.role === 'superadmin' ? ['*'] : ['books'];
    }
    delete values.password;
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
      type: DataTypes.STRING,
      defaultValue: 'admin',
    },
    permissions: {
      type: DataTypes.TEXT,
      defaultValue: '["books"]',
      get() {
        const raw = this.getDataValue('permissions');
        if (!raw) return this.getDataValue('role') === 'superadmin' ? ['*'] : ['books'];
        if (Array.isArray(raw)) return raw;
        try {
          return JSON.parse(raw);
        } catch (_) {
          return [raw];
        }
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('permissions', JSON.stringify(val));
        } else if (typeof val === 'string') {
          try {
            JSON.parse(val);
            this.setDataValue('permissions', val);
          } catch (_) {
            this.setDataValue('permissions', JSON.stringify([val]));
          }
        } else {
          this.setDataValue('permissions', '[]');
        }
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
      get() {
        const val = this.getDataValue('isActive');
        return val !== false && val !== 0;
      },
      set(val) {
        this.setDataValue('isActive', val !== false && val !== 0);
      },
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('id') || this.getDataValue('user_id');
      },
    },
    user_id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('id') || this.getDataValue('user_id');
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
