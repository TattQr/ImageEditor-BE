// // backend/server.js
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const imageRoutes = require('./routes/imageRoutes');

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '500mb' })); // Increase this limit as needed
// app.use(express.urlencoded({ limit: '500mb', extended: true })); // For URL
// app.use('/uploads', express.static('uploads'));

// connectDB();

// app.use('/api/images', imageRoutes);

// app.listen(3001, () => console.log('Server running on http://localhost:3001'));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const imageRoutes = require('./routes/imageRoutes');
const authRoutes = require('./routes/authRoutes')
const Port = process.env.PORT || 8080;

const app = express();

// Increase the limit for JSON and URL-encoded payloads
const payloadLimit = '100mb';

app.use(cors());
app.use(express.json({
    limit: payloadLimit,
    parameterLimit: 100000,
    extended: true
}));
app.use(express.urlencoded({
    limit: payloadLimit,
    parameterLimit: 100000,
    extended: true
}));
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


connectDB();

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Backend is running' });
});


app.use('/api/auth', authRoutes )
app.use('/api/images', imageRoutes);

app.listen(Port, () => console.log(`Server is running on ${Port}`));
