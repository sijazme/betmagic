var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let MarketInstanceSchema = new Schema({
    marketId: { type: Number, required: true },
    eventType: { type: String, required: true },
    competition: { type: String, required: true },
    created: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    timelapse: { type: Number, required: true }
});

module.exports = mongoose.model('MarketInstance', MarketInstanceSchema);