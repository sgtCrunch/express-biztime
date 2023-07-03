
const express = require("express");
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

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

        if(results.rows.length === 0){
            throw new ExpressError("No such invoice", 404);
        }
        
        const company = await db.query(
            `SELECT code, name, description 
            FROM companies
            WHERE code='${results.rows[0].comp_code}'`);

        results.rows[0].company = company;
        delete results.rows[0].comp_code;

        return res.json({invoice : results.rows[0]});
    }
    catch (err) {
        return next(err);
    
    }
    
})

.patch('/:id', async (req, res, next) => {

    try {
        const { amt, paid } = req.body;
        let paidDate = null;

        const current = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id = $1`, [req.params.id]
        );

        if(current.rows.length === 0){
            throw new ExpressError("No such invoice", 404);
        }

        const currPaid = current.rows[0].paid_date;

        if(!currPaid && paid){
            paidDate = new Date();
        }
        else if(!paid){
            paidDate = null;
        }
        else{
            paidDate = currPaid;
        }
    
    
        const result = await db.query(
              `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3
               WHERE id = $4
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, req.params.id]
        );

        
        return res.json({invoice : result.rows[0]});
      }
    
      catch (err) {
        return next(err);
      }
    
})

.delete('/:id', async (req, res, next) => {

    try{

        const result = await db.query(
            "DELETE FROM invoices WHERE id = $1",
            [req.params.id]
        );

        if(result.rows.length === 0){
            throw new ExpressError("No such invoice", 404);
        }
    
        return res.json({"status" : "deleted"});
    }
    catch (err) {
        return next(err);
    }

});


module.exports = router;
