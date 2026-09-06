const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Feedback extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Student name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
        notEmpty: { msg: 'Email is required' },
      },
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    enrollmentNo: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Course name is required' },
      },
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Academic year / semester is required' },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 5,
      },
    },
    category: {
      type: DataTypes.ENUM(
        'academics',
        'faculty',
        'infrastructure',
        'placements',
        'library',
        'general'
      ),
      defaultValue: 'general',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Feedback message is required' },
      },
    },
    status: {
      type: DataTypes.ENUM('new', 'reviewed', 'resolved'),
      defaultValue: 'new',
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
    modelName: 'Feedback',
    tableName: 'feedbacks',
    timestamps: true,
  }
);

module.exports = Feedback;
