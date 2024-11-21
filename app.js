const express = require('express');
const app = express();
const todoRoutes = require('./routes/tododb.js');  // Menjaga route untuk tugas terkait
require('dotenv').config();
const port = process.env.PORT;
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');
const expressLayout = require('express-ejs-layouts');
app.use(expressLayout);
const db = require('./database/db.js');

app.use(express.json());
app.use('/hewan', todoRoutes);

app.use(express.urlencoded({ extended: true }));

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.use('/', authRoutes);
app.set('view engine', 'ejs');

// Route untuk halaman utama yang terautentikasi
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});

// Route untuk halaman kontak
app.get('/contact', isAuthenticated, (req, res) => {
    res.render('contact', {
        layout: 'layouts/main-layout'
    });
});

// Route untuk menampilkan data dari tabel hewan
app.get('/hewan-view', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM hewan', (err, hewan) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('hewan', {
            layout: 'layouts/main-layout',
            hewan: hewan
        });
    });
});

// Menambahkan tugas baru ke tabel hewan (dengan habitat)
app.post('/hewan', isAuthenticated, (req, res) => {
    const { nama, habitat } = req.body;
    const completed = false;  // Default completed to false when adding a new task
    if (!nama || nama.trim() === '' || !habitat || habitat.trim() === '') {
        return res.status(400).send('Nama dan habitat tidak boleh kosong');
    }

    db.query('INSERT INTO hewan (nama, habitat) VALUES (?, ?)', [nama.trim(), habitat.trim()], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        const newHewan = { id: results.insertId, nama: nama.trim(), habitat: habitat.trim()};
        res.status(201).json(newHewan);
    });
});

// Memperbarui tugas di tabel hewan (dengan habitat)
app.put('/hewan/:id', isAuthenticated, (req, res) => {
    const { nama, habitat} = req.body;
    db.query('UPDATE hewan SET nama = ?, habitat = ?WHERE id = ?', [nama, habitat,req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Tugas tidak ditemukan');
        res.json({ id: req.params.id, nama, habitat});
    });
});

// Menghapus tugas dari tabel hewan
app.delete('/hewan/:id', isAuthenticated, (req, res) => {
    db.query('DELETE FROM hewan WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Tugas tidak ditemukan');
        res.status(204).send();
    });
});

// Menangani route yang tidak ditemukan
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
