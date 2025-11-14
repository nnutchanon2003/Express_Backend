const { MongoClient } = require("mongodb");

const url = process.env.mongodb_url;
const dbName = process.env.mongodb_db_name;

const instant = {
  getMongoClient: () => {
    return new MongoClient(url);
  },
  getDbName: () => {
    return dbName;
  },
};

module.exports = instant;
