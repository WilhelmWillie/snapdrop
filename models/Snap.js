var mongoose = require('mongoose');

var SnapSchema = new mongoose.Schema({
  place: String,
  description: String,
  photographer: String,
  loc: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  file: String,
  tags: [String]
});

SnapSchema.index({loc: '2dsphere'});

module.exports = mongoose.model('Snap', SnapSchema);