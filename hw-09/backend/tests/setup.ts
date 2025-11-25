import { sequelize, syncDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.model.js';
import { Task } from '../src/models/Task.model.js';

beforeAll(async () => {
  await syncDatabase(true);
});

afterEach(async () => {
  await Task.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});
