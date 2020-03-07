// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const { server } = require("../src/server");

chai.use(chaiHttp);
chai.should();

describe("Simple Get Test", () => {
    describe("GET /example/test", () => {

        it("should return good", (done) => {
            chai.request(server).
                get('/example/test').
                end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});
