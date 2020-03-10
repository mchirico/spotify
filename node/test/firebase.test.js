const { expect } = require("chai");

const {
    db, surburban, signUp,
    deleteAccount, sendVerifyEmail, signIn, getByEmail, adminref, app
} = require("../src/firebase/utils");

const serviceAccount = require("../credentials/spotifypig-firebase-adminsdk.json");
const databaseConfig = require("../credentials/databaseConfig.json");

describe("Firebase Browser API", () => {

    const addEntry = callback => {
        if (typeof db !== "undefined") {
            // tests setup
            db.collection("users").
                doc("y").
                set({
                    first: "What now okay done...",
                    last: "Lovelace",
                    born: 1815,
                    msg: "Hello world"
                }).
                then(function (docRef) {
                    console.log("Document written with ID: ", docRef.id);
                    callback(docRef.id);
                }).
                catch(function (error) {
                    console.error("Error adding document: ", error);
                    callback(error);
                });
        } else {
            this.skip();
        }
    };

    before(function (done) {
        this.timeout(4000);
        setTimeout(done, 4000);
        addEntry(result => {
            console.log(result);
            done();
        });

    });


    it("Collection query", function (done) {

        this.timeout(4000);
        setTimeout(done, 4000);

        function cleanup() {
            db.collection("users").
                doc("y").
                delete().
                then(function () {
                    console.log("Document successfully deleted!");
                }).
                catch(function (error) {
                    console.error("Error removing document: ", error);
                });
        }

        db.collection("users").
            where("born", "==", 1815).
            get().
            then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.createTime, " => ", doc.data());
                    cleanup();
                    done();
                });
            }).
            catch(function (error) {
                console.log("Error getting documents: ", error);
                done();
            });
    });


});

// Ref: https://firebase.google.com/docs/reference/rest/auth
describe("Firebase REST API", () => {
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
        setTimeout(done, 4000);

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
        setTimeout(done, 4000);

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
        setTimeout(done, 4000);
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

