var express = require('express');
const { glob } = require('fs');
var router = express.Router();
var path = require('path');
const fs = require('fs');

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

router.get('/profile', function(req, res){
    if(!req.oidc.isAuthenticated())
        return res.redirect('/login');
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

router.get('/logout', function(req, res){
    res.oidc.logout({returnTo: 'http://localhost:3000'});
});

router.get('/osvjeziPreslike', function(req, res){
    if(!req.oidc.isAuthenticated())
        return res.redirect('/login');
    const startQueryJson = ` SELECT
        garaze.idGaraza,
        garaze.imeGaraza,
        garaze.ulica,
        garaze.broj,
        kvart,
        brojMjesta,
        brojRazina,
        maksimalnaVisina,
        dostupnostPovlasteneKarte,
        (
            SELECT json_agg(
                json_build_object(
                    'pocetak', radnoVrijeme.pocetak,
                    'kraj', radnoVrijeme.kraj,
                    'cijena', tarife.cijena
                )
            )
            FROM garazatarife
            NATURAL JOIN tarife
            NATURAL JOIN radnoVrijeme
            WHERE garazatarife.idGaraza = garaze.idGaraza
        ) AS tarife,
        json_build_object(
            'idlokacije', tipLokacije.idLokacije,
            'opislokacije', tipLokacije.opisLokacije
        ) AS lokacija
    FROM garaze
    NATURAL JOIN garazatarife
    NATURAL JOIN tarife
    NATURAL JOIN radnovrijeme
    JOIN tiplokacije ON tipLokacije = idLokacije`;

    const startQueryCsv = 'SELECT \
        g.idGaraza, \
        g.imeGaraza,\
        g.ulica, \
        g.broj, \
        g.kvart, \
        g.brojMjesta, \
        g.brojRazina, \
        g.maksimalnaVisina, \
        g.dostupnostPovlasteneKarte, \
        r.pocetak AS pocetak, \
        r.kraj AS kraj, \
        t.cijena, \
        l.idLokacije, \
        l.opisLokacije AS opislokacije \
        FROM garaze g \
        natural join garazatarife \
        natural join tarife t \
        natural join radnovrijeme r \
        join tiplokacije l on idLokacije = tipLokacije';

    const kontekst = {
        "@context":{
            "vocab":"http://schema.org/",
            "imegaraza":"http://schema.org/name",
            "kvart":"http://schema.org/addressLocality"
        }
    }
        
    let lista = [startQueryJson, startQueryCsv];
    console.log('Updating files');
    console.log(lista);
    Promise.all(lista.map(query => global.pool.query(query))).then(results => {
        var garazeJson = results[0].rows.map(garaza => ({
            ...kontekst,
            ...garaza
        }));
        let uniqueResults = Array.from(new Set(garazeJson.map(row => JSON.stringify(row))))
                                 .map(str => JSON.parse(str));
        garazeJson = JSON.parse(JSON.stringify(uniqueResults));
        garazeJson.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });
        const garazeCsv = results[1].rows;
        fs.writeFile(path.join(__dirname, '../data/garazeZagreb.json'), JSON.stringify(garazeJson, null, 2), function(err){
            if(err){
                console.error('Error writing JSON file', err);
                res.status(500).redirect('/');
            }
        });
        fs.writeFile(path.join(__dirname, '../data/garazeZagreb.csv'), garazeCsv.map(row => Object.values(row).join(',')).join('\n'), function(err){
            if(err){
                console.error('Error writing CSV file', err);
                res.status(500).redirect('/');
            }
        });
        res.status(200).redirect('/');
    }).catch(err => {
        console.error('Error updating files', err);
        res.status(500).redirect('/');
    });
});

router.get('/', function(req, res){
    console.log("Tu sam");
    console.log('User authenticated:', req.oidc.isAuthenticated());
    if(req.oidc.isAuthenticated())
        return res.sendFile(path.join(__dirname, '../public/index_login.html'));
    console.log('User not authenticated');
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;