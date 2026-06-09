require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const verifyJWT = require('./middleware/verifyJWT.js');
const cookieParser = require('cookie-parser') ;
const credentials = require('./middleware/credentials.js');
const corsOptions = require('./config/corsOptions.js');

const app = express();

// middleware

// Frontend connect
app.use(credentials);
app.use(cors(corsOptions)); 
app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(morgan('dev'));

//cookie parser
app.use(cookieParser());
//connect to MongoDB
const dbURL = process.env.MONGO_URL;

mongoose.connect(dbURL)
.then(() => {
  app.listen(process.env.PORT)
})
.catch( err => console.log(err));


// API ROUTE

//login system
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/refresh', require('./routes/refresh.js'));
app.use('/api/logout', require('./routes/logout.js'));

//blogs
app.use('/api/blogs', require('./routes/blog.js'));

//documents
app.use('/api/documents', require('./routes/document.js'));

