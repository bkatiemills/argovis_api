const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-almost')(0.00000001));
const rawspec = require('/tests/core-spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const helpers = require('/tests/tests/helpers')
const area = require('/tests/tests/area')

const c = 1
const cellprice = 0.0001
const metaDiscount = 100
const maxbulk = 1000000
const maxbulk_timeseries = 50
const bucketSize = 100

$RefParser.dereference(rawspec, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {

    describe("steradians", function () {
      it("sanity check steradian caclulation", async function () {
        const sum = helpers.geoWeightedSum([{value: 1, lons: [0,180], lats: [0,90]}, {value: 2, lons: [0,90], lats: [0,90]}])
        expect(helpers.steradians([0,360], [-90,90])).to.eql(4*Math.PI)  
      });
    }); 

    describe("steradians", function () {
      it("compares the area of two zones", async function () {
        expect(helpers.steradians([0,360], [89,90])).to.be.lessThan(helpers.steradians([0,360], [0,1]))  
      });
    }); 

    describe("geoWeightedSum", function () {
      it("checks a simple weighted sum over geo regions", async function () {
        const sum = helpers.geoWeightedSum([{value: 1, lons: [0,180], lats: [0,90]}, {value: 2, lons: [0,90], lats: [0,90]}])
        expect(sum).to.almost.equal(2*Math.PI)  
      });
    }); 

    describe("validlonlat", function () {
      it("flags an invalid longitude", async function () {
        points = [[-185.2236986,70.1153552],[-183.9932299,56.4218209],[-155.5166674,56.7123646],[-154.1104174,69.8748184],[-185.2236986,70.1153552]]
        expect(helpers.validlonlat(points)).to.be.false  
      });
    }); 

    describe("cost functions", function () {
      it("cost of entire globe for a day with data for a standard API route", async function () {
        expect(helpers.cost('/argo?startDate=2000-01-01T00:00:00Z&endDate=2000-01-02T00:00:00Z&data=doxy', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries)).to.almost.equal(360000000/13000*1*cellprice);
      });
    }); 

    describe("cost functions", function () {
      it("cost of entire globe for a day with data for a standard API route", async function () {
        expect(helpers.cost('/argo?startDate=2000-01-01T00:00:00Z&endDate=2000-01-02T00:00:00Z', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries)).to.almost.equal(360000000/13000*1*cellprice/metaDiscount);
      });
    }); 

    describe("cost functions", function () {
      it("cost of 15 deg box near equator for 2 years with data for a standard API route should prohibit more than a few such requests in parallel", async function () {
        expect(helpers.cost('/argo?startDate=2000-01-01T00:00:00Z&endDate=2002-01-01T00:00:00Z&polygon=[[0,-7.5],[15,-7.5],[15,7.5],[0,7.5],[0,-7.5]]&data=temperature', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries)*10).to.be.greaterThan(bucketSize);
      });
    }); 

    describe("cost functions", function () {
      it("cost of 15 deg box near equator for 30 years with data for a standard API route should be out of scope", async function () {
        expect(helpers.cost('/argo?startDate=2000-01-01T00:00:00Z&endDate=2030-01-01T00:00:00Z&polygon=[[0,-7.5],[15,-7.5],[15,7.5],[0,7.5],[0,-7.5]]&data=temperature', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries).code).to.eql(413);
      });
    });

    describe("cost functions", function () {
      it("cost of metadata request should be scaled by metaDiscount", async function () {
        expect(helpers.cost('/argo/meta?id=4901283_m0', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries)).to.eql(c/metaDiscount);
      });
    }); 

    describe("cost functions", function () {
      it("cost of metadata request should be scaled my metaDiscount", async function () {
        expect(helpers.cost('/grids/meta?id=kg21_ohc15to300', c, cellprice, metaDiscount, maxbulk, maxbulk_timeseries)).to.eql(c/metaDiscount);
      });
    }); 

    describe("grid prefixes", function () {
      it('checks mapping between grid names and collection names', async function () {
        expect(helpers.find_grid_collection('rg09_temperature_200401_Total')).to.eql('rg09');
      });
    });

    describe("GET /token", function () {
      it("check token fetching - valid", async function () {
        const response = await request.get("/token?token=guest").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.deep.equal({'tokenValid': true})
      });
    });

    describe("GET /token", function () {
      it("check token fetching - invalid", async function () {
        const response = await request.get("/token?token=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("area functions", function () {
      it("should return a small area for a small CCW region when winding matters", async function () {
        expect(area.geometry({'type':'Polygon', 'coordinates': [[[0,0],[1,0],[1,1],[0,1],[0,0]]]}, true)).to.be.lessThan(250000000000000);
      });
    });

    describe("area functions", function () {
      it("should return a large area for a small CW region when winding matters", async function () {
        expect(area.geometry({'type':'Polygon', 'coordinates': [[[0,0],[0,1],[1,1],[1,0],[0,0]]]}, true)).to.be.greaterThan(250000000000000);
      });
    });

    describe("area functions", function () {
      it("should return a small area for a small CW region when winding doesnt matter", async function () {
        expect(area.geometry({'type':'Polygon', 'coordinates': [[[0,0],[0,1],[1,1],[1,0],[0,0]]]}, false)).to.be.lessThan(250000000000000);
      });
    });
}

})