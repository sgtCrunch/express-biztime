
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require('../db');

const { default: slugify } = require("slugify");


/** GET /invoices - returns all invoices in DB */

describe("GET /invoices", function() {
    test("Gets a list of invoices", async function() {
      const resp = await request(app).get(`/invoices`);
      expect(resp.statusCode).toBe(200);
      let invoices = {invoices : [{id: 1, comp_code : "apple"},
                                   {id: 2, comp_code : "apple"},
                                   {id: 3, comp_code : "apple"},
                                   {id: 4, comp_code : "ibm"},]};
      expect(resp.body).toEqual(invoices);
    });
});


/** GET /invoices/[id] - show invoice; */

describe("GET /invoices/:id", function() {
  test("Shows a single invoice", async function() {
    const resp = await request(app)
      .get(`/invoices/1`);
    
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      invoice : { id : 1,
                  amt : 100,
                  paid : false,
                  add_date : '2023-06-30',
                  paid_date : null,
                  company : {code : "apple", 
                            name : "Apple Computer", 
                            description : "Make of OSX."}}
    });
  });

  test("Responds with 404 if id invalid", async function() {
    const resp = await request(app).get(`/invoices/0`);
    expect(resp.statusCode).toBe(404);
  });
});


/** POST /companies - create a company from name */

describe("POST /invoices", function() {
    test("Creates a new invoice", async function() {
      const resp = await request(app)
        .post(`/invoices`)
        .send({
          comp_code : "apple",
          amt : 500
        });
      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({
        invoice : { id : 5,
                    comp_code : "apple",
                    amt : 500,
                    paid : false,
                    add_date : '2023-06-30',
                    paid_date : null}
      });
    });
});  


/** PATCH /invoices/[id] - update invoices; */

describe("PATCH /invoices/:id", function() {
    test("Updates a single invoice", async function() {
      const resp = await request(app)
        .patch(`/invoices/1`)
        .send({
          amt : 2000
        });
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({
        invoice : { id : 1,
                    comp_code : "apple",
                    amt : 2000,
                    paid : false,
                    add_date : '2023-06-30',
                    paid_date : null}
      });
    });
  
    test("Responds with 404 if id invalid", async function() {
      const resp = await request(app).patch(`/invoices/0`);
      expect(resp.statusCode).toBe(404);
    });
});

/** DELETE /invoices/[id] - delete invoice,
 *  return `{message: "Deleted"}` */

describe("DELETE /invoices/:id", function() {
    test("Deletes a single invoice", async function() {
      const resp = await request(app).delete(`/invoices/4`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ message: "Deleted" });
    });

    test("Responds with 404 if code invalid", async function() {
      const resp = await request(app).delete(`/invoices/0`);
      expect(resp.statusCode).toBe(404);
    });

});