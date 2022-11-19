module.exports = function (app) {

    app.get('/', function (req, res) {
        res.status(200).send({
            success: true,
            message: "This is the galileo-champions application backend!",
            data: {}
        })
    });


}