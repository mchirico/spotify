// Import the dependencies for testing
const chai = require('chai');
const expect = chai.expect;

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

    describe("CSRF", () => {

        it("should return good", (done) => {

            chai.request(server).
                get('/example/test').
                end((err, res) => {

                    const cookies = res.headers['set-cookie'];

                    // Example:
                    // [
                    //     '_csrf=RF5HBdEA_9lBJmvloawvfgM; Path=/',
                    //     'XSRF-TOKEN=Ru7RSZMP-AstaiXsIfO2Ia6TKL4Yap2EwxQg; Path=/'
                    // ]
                    //

                    expect(cookies.some(x => x.includes('_csrf='))).to.be.true;
                    expect(cookies.some(x => x.includes('XSRF-TOKEN='))).to.be.true;

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });


        });

        it("should login", (done) => {
            // Log in
            var agent = chai.request.agent(server)
            agent
            .get('/')
            .then(function (res) {
                expect(res).to.have.cookie('_csrf');

                const [, v] = res.headers['set-cookie']
                const key = v.match(/=(.*); /)[1]

                return agent.post('/api/login')
                .set('XSRF-TOKEN', key)
                .send({username: 'me',password: 'somepassword'})
                .then(function (res) {

                    expect(res).to.have.cookie('AccessToken');
                    expect(res).to.have.status(200);
                    return agent.post('/api/transfer_money')
                    .set('XSRF-TOKEN', key)
                    .send({junk: 'junk'})
                    .then(function (res) {

                        res.should.have.status(200)
                        const expected_result = { money: 'Money sent!!  Read access token' }
                        expect(res.body).to.own.include(expected_result);

                        agent.close()
                        done();

                    });

                });
            });
        });



    });

});
