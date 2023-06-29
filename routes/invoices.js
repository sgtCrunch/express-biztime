
const express = require("express");
const router = new express.Router();
const db = require('../db');

router.get("/", async function(req, res, next) {

    try {
        
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`
        );

        return res.json({invoices : results.rows});
    }
    catch (err) {
        return next(err);
    }

    
})
.post("/", async function(req, res, next) {

    try {
        const { comp_code, amt } = req.body;
    
        const result = await db.query(
              `INSERT INTO invoices (comp_code, amt) 
               VALUES ($1, $2)
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
    
        return res.status(201).json({invoice : result.rows[0]});
    }
    catch (err) {
        return next(err);
    }

});

router.get('/:id', async (req, res, next) => {

    try{
        let id = req.params.id;

        const results = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code 
             FROM invoices
             WHERE id='${id}'`);
        
        const company = await db.query(
            `SELECT code, name, description 
            FROM companies
            WHERE code='${results.rows[0].comp_code}'`);

        results.row[0].company = company;
        delete results.row[0].comp_code;

        return res.json({invoice : results.rows[0]});
    }
    catch (err) {
        err.status = 404;
        return next(err);
    
    }
    
})

.patch('/:id', async (req, res, next) => {

    try {
        const { amt } = req.body;
    
        const result = await db.query(
              `UPDATE invoices SET amt=$1
               WHERE id = $2
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, req.params.id]
        );
    
        return res.json({invoice : result.rows[0]});
      }
    
      catch (err) {
        err.status = 404;
        return next(err);
      }
    
})

.delete('/:id', async (req, res, next) => {

    try{

        const result = await db.query(
            "DELETE FROM invoices WHERE id = $1",
            [req.params.id]
        );
    
        return res.json({"status" : "deleted"});
    }
    catch (err) {
        err.status = 404;
        return next(err);
    }

});


module.exports = router;
