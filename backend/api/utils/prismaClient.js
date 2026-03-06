//Gets all the things needed for the database from the .env folder
import "#utils/absoluteEnvPath";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/index.js";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST, // Pulling from .env
  user: process.env.DATABASE_USER, // Pulling from .env
  password: process.env.DATABASE_PASSWORD, // Pulling from .env
  database: process.env.DATABASE_NAME, // Pulling from .env
  port: Number(process.env.DATABASE_PORT) || 3306, // Good to have a fallback
});

const prisma = new PrismaClient({ adapter });

prisma
  .$connect()
  .then(() => {
    console.log("✅ MySQL: Connection established successfully.");
  })
  .catch((err) => {
    console.error("❌ MariaDB: Connection failed!");
    console.error(err);
    // In a healthcare app, you might want to kill the process if the DB is down
    // process.exit(1);
  });

export { prisma };
