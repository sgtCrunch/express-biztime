
process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require('../db');
const { default: slugify } = require("slugify");


/** GET /companies - returns all companies in DB */

describe("GET /companies", function() {
    test("Gets a list of items", async function() {
      const resp = await request(app).get(`/companies`);
      expect(resp.statusCode).toBe(200);
      let companies = {companies : [{code: "apple", name : "Apple Computer"},
                                    {code : "ibm", name : "IBM"}]};
      expect(resp.body).toEqual(companies);
    });
});


/** GET /companies/[code] - show company; */

describe("GET /companies/:code", function() {
  test("Shows a single company", async function() {
    const resp = await request(app)
      .get(`/companies/apple`);
    
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      company : { code : "apple",
                  name : "Apple Computer",
                  description : "Maker of OSX."}
    });
  });

  test("Responds with 404 if code invalid", async function() {
    const resp = await request(app).get(`/companies/0`);
    expect(resp.statusCode).toBe(404);
  });
});


/** POST /companies - create a company from name */

describe("POST /companies", function() {
    test("Creates a new company", async function() {
      const resp = await request(app)
        .post(`/companies`)
        .send({
          name : "Microsoft",
          description : "Windows XP"
        });
      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({
        company : { code : slugify("Microsoft"),
                    name : "Microsoft",
                    description : "Windows XP" }
      });
    });
});  


/** PATCH /companies/[code] - update company; */

describe("PATCH /companies/:code", function() {
    test("Updates a single company", async function() {
      const resp = await request(app)
        .patch(`/companies/${slugify("Microsoft")}`)
        .send({
          name : "Microsoft",
          description : "Windows Vista"
        });
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({
        company : { code : slugify("Microsoft"),
                    name : "Microsoft",
                    description : "Windows Vista"}
      });
    });
  
    test("Responds with 404 if code invalid", async function() {
      const resp = await request(app).patch(`/companies/0`);
      expect(resp.statusCode).toBe(404);
    });
});

/** DELETE /companies/[code] - delete company,
 *  return `{message: "Deleted"}` */

describe("DELETE /companies/:code", function() {
    test("Deletes a single item", async function() {
      const resp = await request(app).delete(`/items/Special Chocolate`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ message: "Deleted" });
    });

    test("Responds with 404 if code invalid", async function() {
      const resp = await request(app).delete(`/companies/0`);
      expect(resp.statusCode).toBe(404);
    });

});