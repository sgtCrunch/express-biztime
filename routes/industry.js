const express = require("express");
const slugify = require('slugify');
const router = new express.Router();
const db = require('../db');

router.get("/", async function(req, res, next) {

    try {

        const allIndustries = await db.query(
            `SELECT code, industry
            FROM industries`
        );

        allIndustries = allIndustries.rows.map(async function(row){
            const companies = await db.query(
            `SELECT c.code
                FROM industries AS i
                    LEFT JOIN company_industry AS ci
                        ON i.code = ci.company_code
                    LEFT JOIN company AS c
                        ON ci.industry_code = c.code
                WHERE i.code='${row.code}'`);
            companies = companies.rows.map(r => r.code);
            row.companies = companies;
        });        
        

        return res.json({industries : allIndustries});
    }
    catch (err) {
        return next(err);
    }

    
})
.post("/", async function(req, res, next) {

    try {
        const { code, industry } = req.body;
    
        const result = await db.query(
              `INSERT INTO industries (code, industry) 
               VALUES ($1, $2)
               RETURNING code, industry`,
            [code, industry]
        );
    
        return res.status(201).json({industry : result.rows[0]});
    }
    catch (err) {
        return next(err);
    }

});

router.post("/add-company/:code", async function(req, res, next) {
    
    try {
        const { company_code } = req.body;
    
        const result = await db.query(
              `INSERT INTO company_industry (company_code, industry_code) 
               VALUES ($1, $2)
               RETURNING company_code, industry_code`,
            [company_code, req.params.code]
        );
    
        return res.status(201).json({success : result.rows[0]});
    }
    catch (err) {
        return next(err);
    }

});