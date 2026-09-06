const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Brochure extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    if (values.linkedProgram && typeof values.linkedProgram === 'object') {
      values.linkedProgram = {
        ...values.linkedProgram,
        _id: values.linkedProgram.id,
      };
    }
    return values;
  }
}

Brochure.init(
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
        notEmpty: { msg: 'Brochure title is required' },
      },
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'File URL is required' },
      },
    },
    fileName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    linkedPage: {
      type: DataTypes.ENUM('home', 'faculty', 'events', 'programs', 'contact', 'general'),
      defaultValue: 'general',
    },
    linkedProgramId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    fileSize: {
      type: DataTypes.STRING,
      defaultValue: '',
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
    modelName: 'Brochure',
    tableName: 'brochures',
    timestamps: true,
  }
);

module.exports = Brochure;
