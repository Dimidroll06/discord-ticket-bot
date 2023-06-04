const { QuickDB, MySQLDriver, SqliteDriver } = require('quick.db');
const path = require('path');
const fs = require('fs');

module.exports = async (client) => {
  console.log('Connecting to DB...');
  let db = null;
  if (client.config.db.mysql?.enabled) {
    await (async () => {
      try {
        require.resolve('mysql2');
      } catch (e) {
        console.error('mysql2 is not installed!\n\nPlease run "npm i mysql2" in the console!');
        throw e.code;
      }

      const mysql = new MySQLDriver({
        host: client.config.db.mysql?.host,
        port: client.config.db.mysql?.port,
        user: client.config.db.mysql?.user,
        password: client.config.db.mysql?.password,
        database: client.config.db.mysql?.database,
        charset: 'utf8mb4',
      });

      await mysql.connect();

      db = new QuickDB({
        driver: mysql,
        table: client.config.db.mysql?.table ?? 'json',
      });

      console.log('mysql database connected');
    })();
  } else {
    const sqlite = new SqliteDriver(path.join(process.cwd(), 'data', 'db', 'tickets.sqlite'));

    if (!fs.existsSync(path.join(process.cwd(), 'data', 'db', 'tickets.sqlite'))) {
      fs.appendFile(path.join(process.cwd(), 'data', 'db', 'tickets.sqlite'), '', (err) => {
        if (err) throw err;
        console.log('Saved!');
      });
    }

    db = new QuickDB({
      driver: sqlite,
      table: 'json',
    });

    console.log('sqlite database connected');

    return db;
  }
};
