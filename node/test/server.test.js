// Import the dependencies for testing
const chai = require('chai');
const expect = chai.expect;

const chaiHttp = require('chai-http');
const { server } = require("../src/server");

chai.use(chaiHttp);
chai.should();

//const serviceAccount = require("../credentials/spotifypig-firebase-adminsdk.json");
const databaseConfig = require("../credentials/databaseConfig.json");


describe("Simple Get Test", function() {
    describe("GET /example/test", () => {

        it("should return good", (done) => {
            this.timeout(4000);
            chai.request(server).
                get('/example/test').
                end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe("CSRF", function() {

        it("should return good", (done) => {
            this.timeout(4000);
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
            this.timeout(4000);
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

describe("Firebase API From Server", function() {

    it("should sign in", (done) => {
        this.timeout(4000);
        // Log in
        var agent = chai.request.agent(server)
        agent
        .get('/')
        .then(function (res) {
            expect(res).to.have.cookie('_csrf');

            const [, v] = res.headers['set-cookie']
            const key = v.match(/=(.*); /)[1]

            return agent.post('/api/signin')
            .set('XSRF-TOKEN', key)
            .send({email: databaseConfig.confirmedEmail,password: databaseConfig.confirmedEmailPassword})
            .then(function (res) {

                expect(res).to.have.cookie('AccessToken');
                expect(res).to.have.status(200);
                expect(res.body.kind).to.be.eq('identitytoolkit#VerifyPasswordResponse')
                done();
            });
        });
    });

    it("should sign up", (done) => {
        this.timeout(4000);
        // Log in
        var agent = chai.request.agent(server)
        agent
        .get('/')
        .then(function (res) {
            expect(res).to.have.cookie('_csrf');

            const [, v] = res.headers['set-cookie']
            const key = v.match(/=(.*); /)[1]

            return agent.post('/api/signup')
            .set('XSRF-TOKEN', key)
            .send({email: databaseConfig.emailtest,password: databaseConfig.emailtestPassword})
            .then(function (res) {

                expect(res).to.have.cookie('AccessToken');
                expect(res).to.have.status(200);

                return agent.post('/api/delete/account')
                .set('XSRF-TOKEN', key)
                .send({idToken: res.body.idToken})
                .then(function (res) {
                    res.should.have.status(200)
                    const expected_result = { kind: 'identitytoolkit#DeleteAccountResponse' }
                    expect(res.body).to.own.include(expected_result);
                    agent.close()
                    done();
                });
                 });
            });
        });

});
