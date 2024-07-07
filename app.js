const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'mysql-58d8802-mzidane49-d8c8.d.aivencloud.com',
    port: 20791,
    user: 'avnadmin',
    password: 'AVNS_lu79HHOc1AXOJDvXyc1',
    database: 'db_doorlock',
    connectionLimit: 10,
});

// Function to handle database queries
function executeQuery(sql, params) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }
            connection.query(sql, params, (err, results) => {
                connection.release();
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    });
}

// Login endpoint
app.post('/login', async (req, res) => {
    const { id, password } = req.body;

    try {
        // Fetch user by id
        const sql = 'SELECT id, password FROM Users WHERE id = ?';
        const params = [id];
        const result = await executeQuery(sql, params);

        if (result.length > 0 && result[0].password === password) {
            res.json(1); // Successful login
        } else {
            res.json(0); // Invalid credentials
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get logs endpoint
app.get('/logs/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch logs by userId
        const sql = 'SELECT * FROM log WHERE id = ?';
        const params = [userId];
        const logs = await executeQuery(sql, params);

        res.json(logs); // Return logs as JSON response
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
