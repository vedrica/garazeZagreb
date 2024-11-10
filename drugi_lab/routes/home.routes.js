var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/getJSON', function(req, res){
    const filePath = path.join(__dirname, '../data/garazeZagreb.json');
    res.download(filePath, 'garazeZagreb.json', function(err){
        if (err) {
            console.error('Error downloading JSON file', err);
            res.status(500).send('Error downloading JSON file');
        }
    });
});

router.get('/getCSV', function(req, res){
    const filePath = path.join(__dirname, '../data/garazeZagreb.csv');
    res.download(filePath, 'garazeZagreb.csv', function(err){
        if (err) {
            console.error('Error downloading CSV file', err);
            res.status(500).send('Error downloading CSV file');
        }
    });
});

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;