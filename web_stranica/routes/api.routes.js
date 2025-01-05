var express = require('express');
const { stat } = require('fs');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const joi = require('joi');

const postSchema = joi.object({
    // idGaraza: joi.number().required(),   ovo se generira u bazi automatski
    imegaraza: joi.string().required(),
    ulica: joi.string().required(),
    broj: joi.number().required(),
    kvart: joi.string().required(),
    brojmjesta: joi.number().required(),
    brojrazina: joi.number().required(),
    maksimalnavisina: joi.number().required(),
    dostupnostpovlastenekarte: joi.boolean().required(),
    tarife: joi.array().items(joi.object({
        pocetak: joi.string().required(),
        kraj: joi.string().required(),
        cijena: joi.number().required()
    })).required(),
    // za lokaciju dopustamo objekt s id i opisom ili samo opis (opis mora postojati u bazi)
    lokacija: joi.alternatives().try(
        joi.object({
            idlokacije: joi.number().required(),
            opislokacije: joi.string().required()
        }),
        joi.string().required()
    ).required()
});

const putSchema = joi.object({
    idgaraza: joi.number().required(),
    imegaraza: joi.string().required(),
    ulica: joi.string().required(),
    broj: joi.number().required(),
    kvart: joi.string().required(),
    brojmjesta: joi.number().required(),
    brojrazina: joi.number().required(),
    maksimalnavisina: joi.number().required(),
    dostupnostpovlastenekarte: joi.boolean().required(),
    tarife: joi.array().items(joi.object({
        pocetak: joi.string().required(),
        kraj: joi.string().required(),
        cijena: joi.number().required()
    })).required(),
    // za lokaciju dopustamo objekt s id i opisom ili samo opis (opis mora postojati u bazi)
    lokacija: joi.alternatives().try(
        joi.object({
            idlokacije: joi.number().required(),
            opislokacije: joi.string().required()
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

function isInteger(value) {
    return /^\d+$/.test(value);
}

router.head('*', function(req, res){
    res.status(501).json();
});

router.get('/brojMjesta', async function(req, res){
    const { operator, value, ...rest } = req.query;
    console.log("operator: " + operator + ", value: " + value);
    if(operator == null || value == null){
        res.status(400).json({
            status: "Bad Request",
            message: "Query parameters operator and value are required",
            response: null
        });
        return;
    }
    if(operator != 'lt' && operator != 'gt' && operator != 'eq'){
        res.status(400).json({
            status: "Bad Request",
            message: "Invalid operator",
            response: null
        });
        return;
    }
    if(Array.isArray(value) || !isInteger(value) && value >= 0){
        res.status(400).json({
            status: "Bad Request",
            message: "Value must be an integer greater than or equal to 0",
            response: null
        });
        return;
    }
    if(rest != null && Object.keys(rest).length > 0){
        res.status(400).json({
            status: "Bad Request",
            message: "Invalid query parameters",
            response: null
        });
        return;
    }
    try{
        let operatorSQL = "=";
        if(operator == 'lt')
            operatorSQL = "<";
        else if(operator == 'gt')
            operatorSQL = ">";

        var query = startQuery + ` WHERE brojMjesta ${operatorSQL} $1`;
        var data = await queryDatabase(query, [value], res);
        let uniqueResults = Array.from(new Set(data.rows.map(row => JSON.stringify(row))))
                                 .map(str => JSON.parse(str));
        data.rows = JSON.parse(JSON.stringify(uniqueResults));
        data.rows.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });

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
    catch(err){
        console.error('Error executing query', err.stack);
        res.status(500).json({
            status: 'Internal Server Error',
            message: 'Error executing query',
            response: null
        });
    }
});

router.get('/name', async function(req, res){
    const { value, ...rest } = req.query;
    if(value == null){
        res.status(400).json({
            status: "Bad Request",
            message: "Query parameter value is required",
            response: null
        });
        return;
    }
    if(rest != null && Object.keys(rest).length > 0 || Array.isArray(value)){
        res.status(400).json({
            status: "Bad Request",
            message: "Invalid query parameters",
            response: null
        });
        return;
    }
    const searchValue = `%${value}%`;
    var query = startQuery + ` WHERE imeGaraza LIKE $1`;
    var data = await queryDatabase(query, [searchValue], res);
    let uniqueResults = Array.from(new Set(data.rows.map(row => JSON.stringify(row))))
                                    .map(str => JSON.parse(str));
    data.rows = JSON.parse(JSON.stringify(uniqueResults));
    data.rows.sort((a, b) => {
        if (a.idgaraza < b.idgaraza) return -1;
        if (a.idgaraza > b.idgaraza) return 1;
        return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
    });
    res.setHeader('Content-Disposition', 'attachment; filename="data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
        status: "OK",
        message: "Data fetched successfully",
        response: {
            data: data.rows
        }
    }, null, 2));
});

router.get('/specifikacija', function(req, res){
    const filePath = path.join(__dirname, '../data', 'openapi.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if(err){
            console.error('Error reading file', err.stack);
            res.status(500).json({
                status: 'Internal Server Error',
                message: 'Error reading file',
                response: null
            });
        }
        res.setHeader('Content-Disposition', 'attachment; filename="openapi.json"');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(data);
    });
});

router.get('/:idGaraze', function(req, res){
    try{
        if(!isInteger(req.params.idGaraze)){
            throw new Error("idGaraze must be an integer");
        }
    }
    catch(err){
        res.status(400).json({
            status: "Bad Request",
            message: `${req.params.idGaraze} is not a valid integer`,
            response: null
        });
        return;
    }
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
            let uniqueResults = Array.from(new Set(data.rows.map(row => JSON.stringify(row)))
                                        ).map(str => JSON.parse(str));
            data.rows = JSON.parse(JSON.stringify(uniqueResults));
            data.rows.sort((a, b) => {
                if (a.idgaraza < b.idgaraza) return -1;
                if (a.idgaraza > b.idgaraza) return 1;
                return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
            });
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
            lokacijaId = req.body.lokacija.idlokacije;
            let data = await queryDatabase("SELECT * FROM tiplokacije WHERE idLokacije = $1", [lokacijaId], res);
            if(data.rows.length == 0){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid idLokacije",
                    response: null
                });
                return;
            }
            console.log("data: " + JSON.stringify(data, null, 2));  
            if(data.rows[0].opislokacije != req.body.lokacija.opislokacije){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid opisLokacije for given idLokacije",
                    response: null
                });
                return;
            }
            req.body.lokacija = data.rows[0].opislokacije; // da bi se kasnije moglo koristiti
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

        var values = [req.body.imegaraza, req.body.ulica, req.body.broj, req.body.kvart, req.body.brojmjesta, req.body.brojrazina, req.body.maksimalnavisina, req.body.dostupnostpovlastenekarte, lokacijaId];

        let data = await queryDatabase(query, values, res);
        //console.log("data: " + JSON.stringify(data, null, 2));
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
    try{
        if(!isInteger(req.params.idGaraze)){
            throw new Error("idGaraze must be an integer");
        }
    }
    catch(err){
        res.status(400).json({
            status: "Bad Request",
            message: `${req.params.idGaraze} is not a valid integer`,
            response: null
        });
        return;
    }
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

router.get('/tipLokacije/:idLokacije', function(req, res){
    try{
        if(!isInteger(req.params.idLokacije)){
            throw new Error("idLokacije must be an integer");
        }
    }
    catch(err){
        res.status(400).json({
            status: "Bad Request",
            message: `${req.params.idLokacije} is not a valid integer`,
            response: null
        });
        return;
    }
    var query = startQuery + " WHERE tipLokacije = $1";
    global.pool.query(query, [req.params.idLokacije], (err, data) => {
        if(err){
            console.error('Error executing query', err.stack);
            res.status(500).json({
                status: 'Internal Server Error',
                message: 'Error executing query',
                response: null
            });
            return;
        }
        // if(data.rows.length == 0){
        //     res.status(404).json({
        //         status: 'Not Found',
        //         message: 'Resource not found, nothing to fetch',
        //         response: null            
        //     });
        //     return;
        // }
        let uniqueResults = Array.from(new Set(data.rows.map(row => JSON.stringify(row))))
                                 .map(str => JSON.parse(str));
        data.rows = JSON.parse(JSON.stringify(uniqueResults));
        data.rows.sort((a, b) => {
            if (a.idgaraza < b.idgaraza) return -1;
            if (a.idgaraza > b.idgaraza) return 1;
            return uniqueResults.indexOf(a) - uniqueResults.indexOf(b);
        });

        res.setHeader('Content-Disposition', 'attachment; filename="data.json"');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({
            status: "OK",
            message: "Data fetched successfully",
            response: {
                data: data.rows
            }
        }, null, 2));
    });
});

router.put('/:idGaraze', async function(req, res){
    try{
        if(!isInteger(req.params.idGaraze)){
            throw new Error("idGaraze must be an integer");
        }
    }
    catch(err){
        res.status(400).json({
            status: "Bad Request",
            message: `${req.params.idGaraze} is not a valid integer`,
            response: null
        });
        return;
    }
    const error = putSchema.validate(req.body).error;
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
            lokacijaId = req.body.lokacija.idlokacije;
            let data = await queryDatabase("SELECT * FROM tiplokacije WHERE idLokacije = $1", [lokacijaId], res);
            if(data.rows.length == 0){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid idLokacije",
                    response: null
                });
                return;
            }
            if(data.rows[0].opislokacije != req.body.lokacija.opislokacije){
                res.status(400).json({
                    status: "Bad Request",
                    message: "Invalid opisLokacije for given idLokacije",
                    response: null
                });
                return;
            }
            lokacijaId = data.rows[0].idlokacije;
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
        
            let dataTarifa = await queryDatabase("SELECT * FROM tarife WHERE cijena = $1 AND idVrijeme = $2", [tarife[i].cijena, idVrijeme], res);
            let tarifaId;
            if(dataTarifa.rows.length == 0){
                dataTarifa = await queryDatabase("INSERT INTO tarife (cijena, idVrijeme) VALUES ($1, $2) RETURNING idTarife", [tarife[i].cijena, idVrijeme], res);
                tarifeId.push(dataTarifa.rows[0].idtarife);
            }
            else
                tarifeId.push(dataTarifa.rows[0].idtarife);
        }
        var query = `UPDATE garaze
            SET imeGaraza = $1, ulica = $2, broj = $3, kvart = $4, brojMjesta = $5, brojRazina = $6, maksimalnaVisina = $7, dostupnostPovlasteneKarte = $8, tipLokacije = $9
            WHERE idGaraza = $10`;
        var values = [req.body.imegaraza, req.body.ulica, req.body.broj, req.body.kvart, req.body.brojmjesta, req.body.brojrazina, req.body.maksimalnavisina, req.body.dostupnostpovlastenekarte, lokacijaId, req.params.idGaraze];
        const data = await queryDatabase(query, values, res);
        
        query = `DELETE FROM garazatarife WHERE idGaraza = $1`;
        values = [req.params.idGaraze];
        await queryDatabase(query, values, res);

        for(var i = 0; i < tarifeId.length; i++){
            query = "INSERT INTO garazatarife (idGaraza, idTarife) VALUES ($1, $2)";
            values = [req.params.idGaraze, tarifeId[i]];
            await queryDatabase(query, values, res);
        }
        res.status(200).json({
            status: "OK",
            message: "Data updated successfully",
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
        return;
    }
});

router.use(function(req, res){
    res.status(501).json({
        status: "Not Implemented",
        message: "Method not implemented for requested resource",
        response: null
    });
});

module.exports = router;