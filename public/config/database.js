const mysql = require('mysql');

var db ;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection({
		  host: "test-db.cebwysbmrbmg.ap-southeast-1.rds.amazonaws.com",
		  user: "admin",
		  password: "admin123",
		  database: "vt_stream",
          // ssl: true,
          // min: 4,
          // max: 10,
          // idleTimeoutMillis: 30000
          // host: "localhost",
          // user: "root",
          // password: "",
          // database: "vt_stream"
		});


        db.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return db;
}
module.exports = connectDatabase();

