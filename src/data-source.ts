import { DataSource } from "typeorm";
import { User } from "./entity/User";
console.log(process.env.DB_HOST);
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // synchronize: process.env.NODE_ENV === "development" ? true : false,
  synchronize: true,
  logging: false,
  entities: [User],
  subscribers: [],
  migrations: [],
  ...(() => {
    if (process.env.NODE_ENV === "production") {
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    } else {
      return {};
    }
  })(),
  dropSchema: process.env.NODE_ENV === "development" ? true : false,
});
