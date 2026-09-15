const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class FacultyRole extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

FacultyRole.init(
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
        notEmpty: { msg: 'Role title is required' },
      },
    },
    designationLevel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'All Faculty Members',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Teaching & Curriculum',
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: 'FiBookOpen',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    responsibilities: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    expectations: {
      type: DataTypes.JSON,
      defaultValue: [],
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
    modelName: 'FacultyRole',
    tableName: 'faculty_roles',
    timestamps: true,
  }
);

module.exports = FacultyRole;
