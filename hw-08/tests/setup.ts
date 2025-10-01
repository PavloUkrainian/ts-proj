import { sequelize, syncDatabase } from '../src/config/database.js';
import '../src/models/User.model.js';
import '../src/models/Task.model.js';
import { Task } from '../src/models/Task.model.js';
import { User } from '../src/models/User.model.js';

beforeAll(async () => {
  await sequelize.authenticate();
  await syncDatabase();
});

beforeEach(async () => {
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

