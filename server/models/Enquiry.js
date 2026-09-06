const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Enquiry extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Enquiry.init(
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
      validate: {
        notEmpty: { msg: 'Email is required' },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
      },
    },
    program: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Program is required' },
      },
    },
    university: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    message: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'enrolled', 'closed'),
      defaultValue: 'new',
    },
    type: {
      type: DataTypes.ENUM('admission_lead', 'enquiry'),
      defaultValue: 'enquiry',
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'website',
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
    modelName: 'Enquiry',
    tableName: 'enquiries',
    timestamps: true,
  }
);

module.exports = Enquiry;
