const { expect } = require("chai");

const {
    db
} = require("../src/firebase/utils");


describe("Firebase Collection", () => {

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
        this.timeout(5000);
        //setTimeout(done, 2000);
        addEntry(result => {
            console.log(result);
            done();
        });

    });


    it("Collection query", function (done) {

        //this.timeout(4000);
        //setTimeout(done, 4000);

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
                    console.log('********************* done 1......')
                    done();
                });
            }).
            catch(function (error) {
                console.log("Error getting documents: ", error);
                console.log('********************* done 2......')
                done();
            });
    });


});
