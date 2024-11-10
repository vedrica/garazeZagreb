var express = require('express');
var router = express.Router();
var path = require('path');

function jsonToCsv(jsonData) {
    let csv = '';
    const headers = Object.keys(jsonData[0]);
    csv += headers.join(',') + '\n';
    jsonData.forEach(obj => {
        const values = headers.map(header => obj[header]);
        csv += values.join(',') + '\n';
    });
    return csv;
}


router.get('/', function(req, res){
    if(req.session.items == null){
        req.session.items = [];
    }
    global.pool.query("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'public'", (err, data) => {
        if (err) {
            console.error('Error executing query', err.stack);
        } else {
            temp = new Set();
            for(var i = 0; i < data.rows.length; i++){
                if(data.rows[i].column_name == 'idtarife' || data.rows[i].column_name == 'idvrijeme') 
                    continue;
                temp.add(data.rows[i].column_name);
            }
            req.session.items = Array.from(temp);
        }
        res.sendFile(path.join(__dirname, '../public/datatable.html'));
    });
});

router.post('/', function(req, res){
    console.log("uspio doc tu");
    var query = "SELECT idGaraza, imeGaraza, ulica, broj, kvart, brojMjesta, brojRazina, maksimalnaVisina, dostupnostPovlasteneKarte, pocetak, kraj, cijena, idLokacije, opisLokacije \
        FROM garaze g \
        natural join garazatarife \
        natural join tarife t \
        natural join radnovrijeme r \
        join tiplokacije l on idLokacije = tipLokacije";
    let queries = [];
    
    if(req.body.search == '') {
        queries.push(global.pool.query(query).catch(err => null));
    }
    else{
        if(req.body.sort == 'wildcard'){
            query += " WHERE";
            for(var i = 0; i < req.session.items.length; i++){
                let tempQuery = query + " " + req.session.items[i] + " = '" + req.body.search + "'";
                queries.push(global.pool.query(tempQuery).catch(err => null));
            }
        }
        else{
            query += " WHERE";
            let tempQuery = query + " " + req.body.sort + " = '" + req.body.search + "'";
            queries.push(global.pool.query(tempQuery).catch(err => null));
        }
    }
    Promise.all(queries).then(data => {
        let results = [];

        for(var i = 0; i < data.length; i++){
            if(data[i] != null){
                for(var j = 0; j < data[i].rows.length; j++){
                    results.push(data[i].rows[j]);
                }
            }
        }
        let uniqueResults = Array.from(new Set(results.map(row => JSON.stringify(row))))
                                     .map(str => JSON.parse(str));
        results = JSON.parse(JSON.stringify(uniqueResults));
        results.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });
        console.log("Results: " + JSON.stringify(results, null, 2));
        res.json(results);        
    });

    // global.pool.query(query, (err, data) => {
    //     if (err) {
    //         console.error('Error executing query', err.stack);
    //         res.status(500).json({error: 'Error executing query'});
    //     } else {
    //         console.log("Rows: " + JSON.stringify(data.rows));
    //         console.log("req.session.items: " + req.session.items);
    //         res.json(data.rows);
    //     }
    // });
});

router.post('/getCSV', function(req, res){
    console.log(req.body);
    var query = "SELECT idGaraza, imeGaraza, ulica, broj, kvart, brojMjesta, brojRazina, maksimalnaVisina, dostupnostPovlasteneKarte, pocetak, kraj, cijena, idLokacije, opisLokacije \
        FROM garaze g \
        natural join garazatarife \
        natural join tarife t \
        natural join radnovrijeme r \
        join tiplokacije l on idLokacije = tipLokacije";
    let queries = [];

    if(req.body.search == '') {
        queries.push(global.pool.query(query).catch(err => null));
    }
    else{
        if(req.body.sort == 'wildcard'){
            query += " WHERE";
            for(var i = 0; i < req.session.items.length; i++){
                let tempQuery = query + " " + req.session.items[i] + " = '" + req.body.search + "'";
                queries.push(global.pool.query(tempQuery).catch(err => console.log(err)));
                console.log("tempQuery: " + tempQuery);	
            }
        }
        else{
            query += " WHERE";
            let tempQuery = query + " " + req.body.sort + " = '" + req.body.search + "'";
            console.log("tempQuery: " + tempQuery);
            queries.push(global.pool.query(tempQuery).catch(err => null));
        }
    }
    Promise.all(queries).then(data => {
        let results = [];
        console.log("Data: " + JSON.stringify(data, null, 2));
        for(var i = 0; i < data.length; i++){
            if(data[i] != null){
                for(var j = 0; j < data[i].rows.length; j++){
                    results.push(data[i].rows[j]);
                }
            }
        }
        let uniqueResults = Array.from(new Set(results.map(row => JSON.stringify(row))))
                                     .map(str => JSON.parse(str));
        results = JSON.parse(JSON.stringify(uniqueResults));
        results.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });
        console.log("Results: " + JSON.stringify(results, null, 2));
        const csv = jsonToCsv(results);
        res.send(csv);
    });
});

router.post('/getJSON', function(req, res){
    var query = `SELECT json_agg(
        json_build_object(
          'idGaraza', garaze.idGaraza,
          'imeGaraza', garaze.imeGaraza,
          'ulica', garaze.ulica,
          'broj', garaze.broj,
          'kvart', garaze.kvart,
          'brojMjesta', garaze.brojMjesta,
          'brojRazina', garaze.brojRazina,
          'maksimalnaVisina', garaze.maksimalnaVisina,
          'dostupnostPovlasteneKarte', garaze.dostupnostPovlasteneKarte,
          'tarife', (
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
            WHERE garaze.idGaraza = garazatarife.idGaraza
          ),
          'lokacija', json_build_object(
            'idlokacije', tipLokacije.idLokacije,
            'opislokacije', tipLokacije.opisLokacije
          )
        )
      )
      FROM garaze
      NATURAL JOIN garazatarife
      NATURAL JOIN tarife
      NATURAL JOIN radnovrijeme
      JOIN tiplokacije on idlokacije = tiplokacije `;
      
      let queries = [];

    if(req.body.search == '') {
        queries.push(global.pool.query(query).catch(err => null));
    }
    else{
        if(req.body.sort == 'wildcard'){
            query += " WHERE";
            for(var i = 0; i < req.session.items.length; i++){
                let tempQuery = query + " " + req.session.items[i] + " = '" + req.body.search + "'";
                queries.push(global.pool.query(tempQuery).catch(err => console.log(err)));
                console.log("tempQuery: " + tempQuery);	
            }
        }
        else{
            query += " WHERE";
            let tempQuery = query + " " + req.body.sort + " = '" + req.body.search + "'";
            console.log("tempQuery: " + tempQuery);
            queries.push(global.pool.query(tempQuery).catch(err => null));
        }
    }
    Promise.all(queries).then(data => {
        let results = [];
        console.log("Data: " + JSON.stringify(data, null, 2));
        console.log("Data.rows: " + JSON.stringify(data[0].rows, null, 2));
        if (data[0].rows && data[0].rows[0].json_agg) {
            results = data[0].rows[0].json_agg;
        }
        let uniqueResults = Array.from(new Set(results.map(row => JSON.stringify(row))))
                                     .map(str => JSON.parse(str));
        results = JSON.parse(JSON.stringify(uniqueResults));
        results.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });
        res.send(results);
    });
    
});
module.exports = router;