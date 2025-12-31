import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  username: process.env.DB_USER || 'u223049366_yasale',
  password: process.env.DB_PASSWORD || 'Zztd7B3%k',
  database: process.env.DB_NAME || 'u223049366_yasale',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
