const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Placement extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Placement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Company name is required' },
      },
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Student name is required' },
      },
    },
    program: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Program name is required' },
      },
    },
    package: {
      type: DataTypes.STRING,
      defaultValue: 'N/A',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Placement year is required' },
      },
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: 'https://via.placeholder.com/150',
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role is required' },
      },
    },
    order: {
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
    modelName: 'Placement',
    tableName: 'placements',
    timestamps: true,
  }
);

module.exports = Placement;
