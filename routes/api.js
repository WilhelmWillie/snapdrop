var express = require('express');
var router = express.Router();

var Snap = require('../models/Snap');

// GET snaps
router.get('/snaps', function(req, res, next) {
  Snap.find(function(err, snaps) {
    if (err)
      res.render('error', { error: err });
    else 
      res.json(snaps);
  })
});

// POST a snap
router.post('/snaps', function(req, res, next) {
  Snap.create({
    place: req.body.place,
    description: req.body.description,
    loc: {
      type: "Point",
      coordinates: [req.body.long, req.body.lat]
    }
  }, function(err, snap) {
    if (err)
      res.render('error', { error: err });
    else 
      res.json(snap);
  });
});

// GET snaps in a certain location
router.get('/snaps/:long/:lat', function(req, res, next) {
  Snap.find({
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [req.params.long, req.params.lat]
        },
        $maxDistance: 1600*3
      }
    }
  }, function(err, snaps) {
    if (err)
      res.render('error', { error: err });
    else
      res.json(snaps);
  });
});

module.exports = router;
