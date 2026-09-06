const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class CampusPhoto extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

CampusPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Image URL is required' },
      },
    },
    caption: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    subCaption: {
      type: DataTypes.STRING,
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
    modelName: 'CampusPhoto',
    tableName: 'campus_photos',
    timestamps: true,
  }
);

class CompanyPartner extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

CompanyPartner.init(
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
        notEmpty: { msg: 'Partner name is required' },
      },
    },
    logoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Logo URL is required' },
      },
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
    modelName: 'CompanyPartner',
    tableName: 'company_partners',
    timestamps: true,
  }
);

module.exports = { CampusPhoto, CompanyPartner };
