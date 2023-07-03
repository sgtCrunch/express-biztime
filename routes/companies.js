
const express = require("express");
const slugify = require('slugify');
const router = new express.Router();
const db = require('../db');

router.get("/", async function(req, res, next) {

    try {
        
        const results = await db.query(
            `SELECT code, name FROM companies`
        );

        return res.json({companies : results.rows});
    }
    catch (err) {
        return next(err);
    }

    
})
.post("/", async function(req, res, next) {

    try {
        const { name, description } = req.body;
    
        const result = await db.query(
              `INSERT INTO companies (code, name, description) 
               VALUES ($1, $2, $3)
               RETURNING code, name, description`,
            [slugify(name), name, description]
        );
    
        return res.status(201).json({company : result.rows[0]});
    }
    catch (err) {
        return next(err);
    }

});

router.get('/:code', async (req, res, next) => {

    try{
        let code = req.params.code;

        const results = await db.query(
            `SELECT code, name, description 
             FROM companies
             WHERE code='${code}'`);

        if(results.rows.length === 0){
            throw new ExpressError("No such company", 404);
        }

        const invoices = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date 
                FROM invoices
                WHERE comp_code='${code}'`);

        const industries = await db.query(
            `SELECT i.industry
                FROM companies AS c
                    LEFT JOIN company_industry AS ci
                        ON c.code = ci.company_code
                    LEFT JOIN industries AS i
                        ON ci.industry_code = i.code
                WHERE c.code='${code}'`);

        results.invoices = invoices;
        results.industries = industries;
      
        return res.json({company : results.rows[0]});
    }
    catch (err) {
        return next(err);
    
    }
    
})

.patch('/:code', async (req, res, next) => {

    try {
        const { name, description } = req.body;
    
        const result = await db.query(
              `UPDATE companies SET name=$1, description=$2
               WHERE code = $3
               RETURNING code, name, description`,
            [name, description, req.params.code]
        );
        
        if(result.rows.length === 0){
            throw new ExpressError("No such company", 404);
        }
    
        return res.json({company : result.rows[0]});
      }
    
      catch (err) {
        return next(err);
      }
    
})

.delete('/:code', async (req, res, next) => {

    try{

        const result = await db.query(
            "DELETE FROM companies WHERE code = $1",
            [req.params.code]
        );

        if(result.rows.length === 0){
            throw new ExpressError("No such company", 404);
        }
    
        return res.json({"status" : "deleted"});
    }
    catch (err) {
        return next(err);
    }

});


module.exports = router;
