require('dotenv').config({ path: './database.env' });

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

const PORT = 3000;

// ==========================================
// Middleware
// ==========================================

app.use(express.json());
app.use(express.static('public'));


// ==========================================
// MySQL Configuration
// ==========================================

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306
};

let db = null;
let dbReady = false;


// ==========================================
// Connect to MySQL
// ==========================================

function connectDatabase() {

    console.log(
        `Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`
    );

    db = mysql.createConnection(dbConfig);

    db.connect((err) => {

        // --------------------------------------
        // MySQL connection failed
        // --------------------------------------

        if (err) {

            dbReady = false;

            console.error(
                'MySQL connection failed:',
                err.code
            );

            console.log(
                'Retrying MySQL connection in 5 seconds...'
            );

            setTimeout(connectDatabase, 5000);

            return;
        }


        // --------------------------------------
        // MySQL connection successful
        // --------------------------------------

        dbReady = true;

        console.log(
            'Connected to MySQL successfully'
        );


        // --------------------------------------
        // Create table AFTER MySQL connection
        // --------------------------------------

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS names (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `;

        db.query(createTableQuery, (err) => {

            if (err) {

                console.error(
                    'Table creation failed:',
                    err
                );

                return;
            }

            console.log(
                'Table "names" is ready'
            );
        });
    });
}


// Start MySQL connection
connectDatabase();


// ==========================================
// Database Middleware
// ==========================================

function checkDatabase(req, res, next) {

    if (!dbReady) {

        return res.status(503).json({
            error: 'Database is not ready'
        });
    }

    next();
}


// ==========================================
// Homepage
// ==========================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});


// ==========================================
// Health Check
// ==========================================

app.get('/health', (req, res) => {

    if (!dbReady) {

        return res.status(503).json({
            status: 'unhealthy',
            database: 'not ready'
        });
    }

    res.json({
        status: 'healthy',
        database: 'connected'
    });
});


// ==========================================
// GET ALL NAMES
// ==========================================

app.get('/names', checkDatabase, (req, res) => {

    db.query(
        'SELECT * FROM names',
        (err, results) => {

            if (err) {

                console.error(
                    'SELECT error:',
                    err
                );

                return res.status(500).json({
                    error: 'Failed to fetch names'
                });
            }

            res.json(results);
        }
    );
});


// ==========================================
// CREATE NAME
// ==========================================

app.post('/names', checkDatabase, (req, res) => {

    const { name } = req.body;

    if (!name) {

        return res.status(400).json({
            error: 'Name is required'
        });
    }

    db.query(
        'INSERT INTO names (name) VALUES (?)',
        [name],
        (err, result) => {

            if (err) {

                console.error(
                    'INSERT error:',
                    err
                );

                return res.status(500).json({
                    error: 'Failed to insert name'
                });
            }

            res.json({
                id: result.insertId,
                name: name
            });
        }
    );
});


// ==========================================
// UPDATE NAME
// ==========================================

app.put('/names/:id', checkDatabase, (req, res) => {

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {

        return res.status(400).json({
            error: 'Name is required'
        });
    }

    db.query(
        'UPDATE names SET name = ? WHERE id = ?',
        [name, id],
        (err, result) => {

            if (err) {

                console.error(
                    'UPDATE error:',
                    err
                );

                return res.status(500).json({
                    error: 'Failed to update name'
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: 'Name not found'
                });
            }

            res.json({
                message: 'Name updated successfully'
            });
        }
    );
});


// ==========================================
// DELETE NAME
// ==========================================

app.delete('/names/:id', checkDatabase, (req, res) => {

    const { id } = req.params;

    db.query(
        'DELETE FROM names WHERE id = ?',
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    'DELETE error:',
                    err
                );

                return res.status(500).json({
                    error: 'Failed to delete name'
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: 'Name not found'
                });
            }

            res.json({
                message: 'Name deleted successfully'
            });
        }
    );
});


// ==========================================
// Start Node.js Server
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});

