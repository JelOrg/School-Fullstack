import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mysql from "mysql2/promise";

// 1. Create the actual connection to MariaDB
const pool = mysql.createPool(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb(pool);

// 2. Pass that adapter into the client
// This maintains your code completion while making it functional
const prisma = new PrismaClient({ adapter });

export default prisma;
