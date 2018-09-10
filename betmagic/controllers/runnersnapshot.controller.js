const RunnerSnapshot = require('../models/runnersnapshot.model');

exports.runnersnapshot_create = function (req, res) {
    let runnersnapshot = new RunnerSnapshot(
        {
            marketInstanceId: req.body.marketInstanceId,
            selectionId: req.body.selectionId,
            runnerName: req.body.runnerName,
            lastPriceTraded: req.body.lastPriceTraded,
            totalMatched: req.body.totalMatched
        }
    );

    runnersnapshot.save(function (err) {
        if (err) {
            return err;
        }
        res.send('RunnerSnapshot Created successfully')
    })
};


exports.runnersnapshot_details = function (req, res) {
    RunnerSnapshot.findById(req.params.id, function (err, runnersnapshot) {
        if (err) return err;
        res.send(runnersnapshot);
    })
};

exports.runnersnapshot_update = function (req, res) {
    RunnerSnapshot.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, runnersnapshot) {
        if (err) return err;
        res.send('runnersnapshot udpated.');
    });
};

exports.runnersnapshot_delete = function (req, res) {
    RunnerSnapshot.findByIdAndRemove(req.params.id, function (err) {
        if (err) return err;
        res.send('Deleted successfully!');
    })
};
