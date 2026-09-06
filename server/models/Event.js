const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Event extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event title is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event description is required' },
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event date is required' },
      },
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    category: {
      type: DataTypes.ENUM('seminar', 'workshop', 'conference', 'cultural', 'placement', 'other'),
      defaultValue: 'other',
    },
    isUpcoming: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
  }
);

module.exports = Event;
