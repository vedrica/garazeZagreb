const express = require('express');
const app = express();
const {Pool} = require('pg');
const session = require("express-session");
var path = require('path');
const { auth } = require('express-openid-connect');

global.pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'garazeZagreb',
    password: 'baze',
    port: 5432
});

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: '9d04661b27792033062d1638b94cd04b0d576fb735faaf706459ace84b0c24a9',
    baseURL: 'http://localhost:3000',
    clientID: 'OCHupIbMIQjrbw2vhqjDK78yWItYVKrM',
    issuerBaseURL: 'https://dev-1vfq00yu2k3hgxmj.eu.auth0.com'
};

app.use(auth(config));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'), {index: false}));
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
const apiRouter = require('./routes/api.routes');

app.use('/search', searchRouter);
app.use('/api', apiRouter);
app.use('/', homeRouter);

app.listen(3000);