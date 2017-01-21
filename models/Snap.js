var mongoose = require('mongoose');

var SnapSchema = new mongoose.Schema({
  place: String,
  description: String,
  loc: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  likes: Number
});

SnapSchema.index({loc: '2dsphere'});

module.exports = mongoose.model('Snap', SnapSchema);