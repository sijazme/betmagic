const MarketInstance = require('../models/marketinstance.model');

exports.marketinstance_create = function (req, res) {
    let marketinstance = new MarketInstance(
        {
            marketId: req.body.marketId,
            eventType: req.body.eventType,
            competition: req.body.competition,           
            created: req.body.created,
            startTime: req.body.startTime,
            timelapse: req.body.timelapse
        }
    );

    marketinstance.save(function (err, doc) {
        if (err) {
            return (err);
        }
        res.send(doc._id)
    })
};


exports.marketinstance_details = function (req, res) {
    MarketInstance.findById(req.params.id, function (err, marketinstance) {
        if (err) return (err);
        res.send(marketinstance);
    })
};

exports.marketinstance_update = function (req, res) {
    MarketInstance.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, marketinstance) {
        if (err) return (err);
        res.send('marketinstance udpated.');
    });
};

exports.marketinstance_delete = function (req, res) {
    MarketInstance.findByIdAndRemove(req.params.id, function (err) {
        if (err) return (err);
        res.send('Deleted successfully!');
    })
};


exports.test = function (req, res) {
    res.send('Greetings from the marketinstance controller!');
};