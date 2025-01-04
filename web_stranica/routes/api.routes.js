var express = require('express');
const { stat } = require('fs');
var router = express.Router();
var path = require('path');
const joi = require('joi');

const postSchema = joi.object({
    // idGaraza: joi.number().required(),   ovo se generira u bazi automatski
    imeGaraza: joi.string().required(),
    ulica: joi.string().required(),
    broj: joi.number().required(),
    kvart: joi.string().required(),
    brojMjesta: joi.number().required(),
    brojRazina: joi.number().required(),
    maksimalnaVisina: joi.number().required(),
    dostupnostPovlasteneKarte: joi.boolean().required(),
    tarife: joi.array().items(joi.object({
        pocetak: joi.string().required(),
        kraj: joi.string().required(),
        cijena: joi.number().required()
    })).required(),
    // za lokaciju dopustamo objekt s id i opisom ili samo opis (opis mora postojati u bazi)
    lokacija: joi.alternatives().try(
        joi.object({
            idLokacije: joi.number().required(),
            opisLokacije: joi.string().required()
        }),
        joi.string().required()
    ).required()
});

const startQuery = `
    SELECT
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

async function queryDatabase(query, values, res){
    return new Promise((resolve, reject) => {
        global.pool.query(query, values, (err, data) => {
            if(err)
                reject(err);
            resolve(data);
        });
    });
}

router.head('*', function(req, res){
    res.status(501).json();
});

router.get('/:idGaraze', function(req, res){
    global.pool.query(startQuery + " WHERE idGaraza = $1", [req.params.idGaraze], (err, data) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({
                status: 'Internal Server Error',
                message: 'Error executing query',
                response: null
            });
        } 
        else if(data.rows.length == 0){
            res.status(404).json({
                status: 'Not Found',
                message: 'Resource not found',
                response: null            
            });
        }
        else {
            res.setHeader('Content-Disposition', 'attachment; filename="data.json"');
            res.setHeader('Content-Type', 'application/json');
            var results = [];
            for (var i = 0; i < data.rows.length; i++) {
                results.push(data.rows[i]);
            }
            let uniqueResults = Array.from(new Set(results.map(row => JSON.stringify(row))))
                                         .map(str => JSON.parse(str));
            results = JSON.parse(JSON.stringify(uniqueResults));
            results.sort((a, b) => {
                if (a.idgaraza < b.idgaraza) return -1;
                if (a.idgaraza > b.idgaraza) return 1;
                return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
            });

            res.status(200).send(JSON.stringify({
                status: "OK",
                message: "Data fetched successfully",
                response: {
                    data: results
                }
            }, null, 2));
        }
    });
});
    
router.get('/', function(req, res){
    global.pool.query(startQuery, (err, data) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({error: 'Error executing query'});
        } else {
            res.setHeader('Content-Disposition', 'attachment; filename="data.json"');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify({
                status: "OK",
                message: "Data fetched successfully",
                response: {
                    data: data.rows
                }
            }, null, 2));
        }
    });
});

router.post('/', async function(req, res){
    const error = postSchema.validate(req.body).error;
    if(error){
        res.status(400).json({
            status: "Bad Request",
            message: error.details[0].message,
            response: null
        });
        return; 
    }
    try{
        let tarifeId = [], lokacijaId;
        if(typeof req.body.lokacija === 'object'){
            lokacijaId = req.body.lokacija.idLokacije;
            let data = await queryDatabase("SELECT * FROM tiplokacije WHERE idLokacije = $1", [lokacijaId], res);
            if(data.rows.length == 0){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid idLokacije",
                    response: null
                });
                return;
            }
            if(data.rows[0].opisLokacije != req.body.lokacija.opisLokacije){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid opisLokacije for given idLokacije",
                    response: null
                });
                return;
            }
        }
        else{
            let data = await queryDatabase("SELECT idLokacije FROM tiplokacije WHERE opisLokacije = $1", [req.body.lokacija], res);
            if(data.rows.length == 0){
                var tmpData = await queryDatabase("INSERT INTO tiplokacije (opisLokacije) VALUES ($1) RETURNING idLokacije", [req.body.lokacija], res);
                lokacijaId = tmpData.rows[0].idlokacije;
            }
            else
                lokacijaId = data.rows[0].idlokacije;
        }

        let tarife = req.body.tarife;
        //console.log(tarife);
        for(var i = 0; i < tarife.length; i++){
            let dataVrijeme = await queryDatabase("SELECT * FROM radnovrijeme WHERE pocetak = $1 AND kraj = $2", [tarife[i].pocetak, tarife[i].kraj], res);
            let idVrijeme;
            //console.log("dataVrijeme: " + JSON.stringify(dataVrijeme, null, 2));
            if(dataVrijeme.rows.length == 0){
                dataVrijeme = await queryDatabase("INSERT INTO radnovrijeme (pocetak, kraj) VALUES ($1, $2) RETURNING idVrijeme", [tarife[i].pocetak, tarife[i].kraj], res);
                idVrijeme = dataVrijeme.rows[0].idvrijeme;
            }
            else
                idVrijeme = dataVrijeme.rows[0].idvrijeme;
            
            //console.log("idVrijeme: " + idVrijeme);
            let dataTarifa = await queryDatabase("SELECT * FROM tarife WHERE cijena = $1 AND idVrijeme = $2", [tarife[i].cijena, idVrijeme], res);
            let tarifaId;
            if(dataTarifa.rows.length == 0){
                dataTarifa = await queryDatabase("INSERT INTO tarife (cijena, idVrijeme) VALUES ($1, $2) RETURNING idTarife", [tarife[i].cijena, idVrijeme], res);
                tarifeId.push(dataTarifa.rows[0].idtarife);
            }
            else
                tarifeId.push(dataTarifa.rows[0].idtarife);
        }


        var query = "INSERT INTO garaze \
            (imeGaraza, ulica, broj, kvart, brojMjesta, brojRazina, maksimalnaVisina, dostupnostPovlasteneKarte, tipLokacije) \
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) \
            RETURNING idGaraza";

        var values = [req.body.imeGaraza, req.body.ulica, req.body.broj, req.body.kvart, req.body.brojMjesta, req.body.brojRazina, req.body.maksimalnaVisina, req.body.dostupnostPovlasteneKarte, lokacijaId];

        let data = await queryDatabase(query, values, res);
        console.log("data: " + JSON.stringify(data, null, 2));
        var idGaraza = data.rows[0].idgaraza;
        for(var i = 0; i < tarifeId.length; i++){
            query = "INSERT INTO garazatarife (idGaraza, idTarife) VALUES ($1, $2)";
            values = [idGaraza, tarifeId[i]];
            await queryDatabase(query, values, res);
        }
        res.status(200).json({
            status: "OK",
            message: "Data added successfully",
            response: null
        });
    }
    catch(err){
        console.error('Error executing query', err.stack);
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Error executing query',
            response: null
        });
    }
});

router.delete('/:idGaraze', function(req, res){
    global.pool.query(`DELETE FROM garaze WHERE idGaraza = $1`, [req.params.idGaraze], (err, data) => {
        if(err){
            console.error('Error executing query', err.stack);
            res.status(500).json({
                status: 'Internal Server Error',
                message: 'Error executing query',
                response: null
            });
            return;
        }
        if(data.rowCount == 0){
            res.status(404).json({
                status: 'Not Found',
                message: 'Resource not found, nothing to delete',
                response: null            
            });
            return;
        }
        res.status(200).json({
            status: "OK",
            message: "Data deleted successfully",
            response: null
        });
    });
});

router.use(function(req, res){
    res.status(501).json({
        status: "Not Implemented",
        message: "Method not implemented for requested resource",
        response: null
    });
});

module.exports = router;