import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.model.js';
import type { Status, Priority } from '../types/task.types.js';
import { STATUS_VALUES, PRIORITY_VALUES } from '../types/task.types.js';

interface TaskAttributes {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  deadline: Date | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'status' | 'priority' | 'deadline' | 'createdAt' | 'updatedAt'> {
  userId: number;
}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: number;
  declare title: string;
  declare description: string | null;
  declare status: Status;
  declare priority: Priority;
  declare deadline: Date | null;
  declare userId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_VALUES),
      allowNull: false,
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM(...PRIORITY_VALUES),
      allowNull: false,
      defaultValue: 'medium',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
  }
);

Task.belongsTo(User, { foreignKey: 'userId', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });



