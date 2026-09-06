const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Faculty extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Faculty.init(
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
        notEmpty: { msg: 'Faculty name is required' },
      },
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Designation is required' },
      },
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Qualification is required' },
      },
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Experience is required' },
      },
    },
    specialization: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Faculty',
    tableName: 'faculties',
    timestamps: true,
  }
);

module.exports = Faculty;
