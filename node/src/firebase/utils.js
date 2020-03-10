require("firebase/firestore");
const request = require("request");

const admin = require("firebase-admin");
const serviceAccount = require("../../credentials/spotifypig-firebase-adminsdk.json");
const databaseConfig = require("../../credentials/databaseConfig.json");

const signInExtract = (data, callback) => {
    let AuthResponseData = {
        kind: null,
        idToken: null,
        email: null,
        refreshToken: null,
        expiresIn: null,
        localId: null,
        message: null
    };

    if (data.idToken) {
        AuthResponseData.kind = data.kind;
        AuthResponseData.idToken = data.idToken;
        AuthResponseData.email = data.email;
        AuthResponseData.refreshToken = data.refreshToken;
        AuthResponseData.expiresIn = data.expiresIn;
        AuthResponseData.localId = data.localId;
    }
    if (data.error) {
        if (data.error.message) {
            AuthResponseData.message = data.error.message;
        }
    }
    callback(AuthResponseData);
};

const accountExtract = (data, callback) => {
    const AccountData = {
        uid: null,
        email: null,
        emailVerified: null,
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        disabled: null,
        providerData: null
    };

    if (data.email) {
        AccountData.uid = data.uid;
        AccountData.email = data.email;
        AccountData.emailVerified = data.emailVerified;
        AccountData.displayName = data.displayName;
        AccountData.photoURL = data.photoURL;
        AccountData.phoneNumber = data.phoneNumber;
        AccountData.disabled = data.disabled;
        AccountData.providerData = data.providerData;
    }
    callback(AccountData);
};


const signUp = (email, password, callback) => {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${databaseConfig.WebAPIKey}`;
    request.post(url, {
        json: {
            email: email,
            password: password,
            returnSecureToken: true
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            callback('error');
            return;
        }
        if (res.statusCode == 200) {
            signInExtract(res.body, data => {
                //console.log("idToken:", data.idToken);
                callback(data);
            });
            return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        //console.log(`localId: ${res.json.localId}`)
        callback(res.body);
    });
};

const signIn = (email, password, callback) => {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${databaseConfig.WebAPIKey}`;
    request.post(url, {
        json: {
            email: email,
            password: password,
            returnSecureToken: true
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            callback('error');
            return;
        }
        if (res.statusCode == 200) {
            signInExtract(res.body, data => {
                //console.log("idToken:", data.idToken);
                callback(data);
            });
            return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        //console.log(`localId: ${res.json.localId}`)
        signInExtract(res.body, data => {
            //console.log("idToken:", data.idToken);
            callback(data);
        });

    });
};

const deleteAccount = (idToken, callback) => {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${databaseConfig.WebAPIKey}`;
    request.post(url, {
        json: {
            idToken: idToken
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            callback(res.body);
            return;
        }
        if (res.statusCode == 200) {
            callback(res.body);
            return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        //console.log(`localId: ${res.json.localId}`)
        callback(res.body);

    });

};

const sendVerifyEmail = (idToken, callback) => {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${databaseConfig.WebAPIKey}`;
    request.post(url, {
        json: {
            requestType: 'VERIFY_EMAIL',
            idToken: idToken
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            callback(res.body);
            return;
        }
        if (res.statusCode == 200) {
            //console.log(body);
            callback(res.body);
            return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        //console.log(`localId: ${res.json.localId}`)
        callback(res.body);

    });

};

const surburban = callback => {
    const url = "https://www3.septa.org/hackathon/Arrivals/Suburban%20Station/5/";
    request({
        url: url,
        json: true
    }, (error, response) => {
        if (error) {
            console.log("\n\n **** error *****\n");
        }

        septaExtract(response.body, data => {
            callback(data);
        });
    });
};

// FIXME: This  isn't right.. causes issues with testing
let app = null;
const getDB = function () {

    if (!admin.apps.length) {
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: databaseConfig.databaseURL
        });
        return app.firestore();
    }
};
// Update user: https://firebase.google.com/docs/auth/admin/manage-users

const pgetUserByEmail = (email, callback) => {
    admin.auth().
        getUserByEmail(email).
        then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            //console.log('Successfully fetched user data:', userRecord.toJSON());

            accountExtract(userRecord, data => {
                //console.log("idToken:", data.idToken);
                callback(data);
            });

        }).
        catch(function (error) {
            console.log('Error fetching user data:', error);
            callback('error');
        });
};

const pgetUserInfo = (phone, callback) => {
    admin.auth().
        getUserByPhoneNumber(phone).
        then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully fetched user data:', userRecord.toJSON());
            callback(userRecord.uid);
        }).
        catch(function (error) {
            console.log('Error fetching user data:', error);
        });
};

const pdelUser = (uid, callback) => {
    admin.auth().
        deleteUser(uid).
        then(function () {
            callback('Successfully deleted user');
        }).
        catch(function (error) {
            console.log('Error deleting user:', error);
            callback('Error deleting user:', error);
        });
};

module.exports = {
    db: getDB(),
    app: app,
    adminref: admin,
    getUserInfo: pgetUserInfo,
    getByEmail: pgetUserByEmail,
    delUserfb: pdelUser,
    signUp: signUp,
    deleteAccount: deleteAccount,
    sendVerifyEmail: sendVerifyEmail,
    signIn: signIn
};
