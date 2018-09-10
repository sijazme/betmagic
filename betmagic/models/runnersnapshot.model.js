const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RunnerSnapshotSchema = new Schema({    
    marketInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketInstance' },
    selectionId: { type: Number, required: true },
    runnerName: { type: String, required: true },
    lastPriceTraded: { type: Number, required: true },
    totalMatched: { type: Number, required: true }
});


// Export the model
module.exports = mongoose.model('RunnerSnapshot', RunnerSnapshotSchema);