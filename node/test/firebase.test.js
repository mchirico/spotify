const { expect } = require("chai");

const {
    signUp,
    deleteAccount, sendVerifyEmail, signIn, getByEmail, adminref, app
} = require("../src/firebase/utils");

const serviceAccount = require("../credentials/spotifypig-firebase-adminsdk.json");
const databaseConfig = require("../credentials/databaseConfig.json");


// Ref: https://firebase.google.com/docs/reference/rest/auth
describe("Firebase REST API",function() {

    it("Can we read databaseConfig", function (done) {

        const databaseConfig = require("../credentials/databaseConfig.json");
        expect(databaseConfig.databaseURL).
            to.
            include('https://');
        expect(databaseConfig.emailtest).
            to.
            include('@');
        expect(databaseConfig.confirmedEmail).
            to.
            include('@');
        expect(databaseConfig.WebAPIKey).
            to.
            be.
            lengthOf(39);

        done();
    });

    it("Firebase signUp and deleteAccount", function (done) {

        this.timeout(4000);

        const databaseConfig = require("../credentials/databaseConfig.json");
        const email = databaseConfig.emailtest;
        const password = databaseConfig.emailtestPassword;
        let idToken = null;
        signUp(email, password, data => {

            idToken = data.idToken;

            sendVerifyEmail(idToken, data => {
                expect(data.kind).
                    to.
                    be.
                    eq('identitytoolkit#GetOobConfirmationCodeResponse');

                deleteAccount(idToken, data => {
                    expect(data.kind).
                        to.
                        be.
                        eq('identitytoolkit#DeleteAccountResponse');
                    done();
                });
            });
        });
    });

    it("Firebase signIn confirmed account ", function (done) {
        const databaseConfig = require("../credentials/databaseConfig.json");
        const email = databaseConfig.confirmedEmail;
        const password = databaseConfig.confirmedEmailPassword;
        let idToken = null;
        signIn(email, password, data => {
            idToken = data.idToken;
            done();
        });
    });

    it("Firebase account not exist ", function (done) {
        const databaseConfig = require("../credentials/databaseConfig.json");
        const email = 'bozo@gmail.com';
        const password = 'bozo323232';
        let idToken = null;
        signIn(email, password, data => {
            idToken = data.idToken;
            console.log(data)
            expect(data.message).
                to.
                be.
                eq('EMAIL_NOT_FOUND');

            done();
        });
    });
});


describe("Service Account Functions", () => {
    before(function (done) {
        this.timeout(4000);
        if (!adminref.apps.length) {
            app = adminref.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: databaseConfig.databaseURL
            });
        }
        done();
    });

    after(function (done) {
        this.timeout(4000);
        app.delete().
            then(function () {
                console.log("App deleted successfully");
                done();
            }).
            catch(function (error) {
                console.log("Error deleting app:", error);
                done();
            });
    });

    it("Firebase get info on account ", function (done) {
        const email = databaseConfig.confirmedEmail;
        const password = databaseConfig.confirmedEmailPassword;
        let idToken = null;
        getByEmail(email, data => {
            console.log(data);
            expect(data.email).
                to.
                be.
                eq(databaseConfig.confirmedEmail);

            done();
        });
    });


});

