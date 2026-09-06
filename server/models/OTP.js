const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OTP extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

OTP.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
      },
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'OTP is required' },
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Expiry date is required' },
      },
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: 'OTP',
    tableName: 'otps',
    timestamps: true,
    indexes: [
      {
        fields: ['phone'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

module.exports = OTP;
