const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Program extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Program.init(
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
        notEmpty: { msg: 'Program title is required' },
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Short description is required' },
      },
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Program overview is required' },
      },
    },
    eligibility: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Eligibility criteria is required' },
      },
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Duration is required' },
      },
    },
    careerOpportunities: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    industryExposure: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    highlights: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    universities: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    category: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    brochureUrl: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Program',
    tableName: 'programs',
    timestamps: true,
    hooks: {
      beforeValidate: (program) => {
        if (!program.slug && program.title) {
          program.slug = program.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    },
  }
);

module.exports = Program;
