const admin = require("firebase-admin");
const serviceAccount = require("./fbServiceAccountKey.json");
const {getFirestore} = require("firebase-admin/firestore");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const fbConn = getFirestore();

module.exports = {
    fbConn: fbConn
};