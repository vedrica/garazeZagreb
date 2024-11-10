const express = require('express');
const app = express();
const {Pool} = require('pg');
const session = require("express-session");
var path = require('path');

global.pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'garazeZagreb',
    password: 'baze',
    port: 5432
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use(session({
    secret: 'tajniKljuc',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const homeRouter = require('./routes/home.routes');
const searchRouter = require('./routes/search.routes');
app.use('/search', searchRouter);
app.use('/', homeRouter);

app.listen(3000);