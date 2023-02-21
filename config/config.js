var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    // database: 'nodedb',
    database: 'cruddb',
    

});


// var connection = mysql.createConnection({multipleStatements: true});

// connection.connect((err) => {
//     if (err) {
//         console.log('error');
//     }
//     else {
//         console.log('connected');
//     }
// });

module.exports = connection;