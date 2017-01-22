var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads/' });

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
router.post('/snaps', upload.single('file'), function(req, res, next) {
  Snap.create({
    place: req.body.place,
    description: req.body.description,
    photographer: req.body.photographer,
    loc: {
      type: "Point",
      coordinates: [req.body.long, req.body.lat]
    },
    file: req.file.filename
  }, function(err, snap) {
    if (err) {
      res.render('error', { error: err });
      return;
    }
    
    res.json(snap);
  });
});



// NO LONGER USED but keeping this code for future reference
// GET snaps in a certain location (RADIUS)
router.get('/snaps/:long/:lat', function(req, res, next) {
  Snap.find({
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [req.params.long, req.params.lat]
        },
        $maxDistance: 1600*10
      }
    }
  }, function(err, snaps) {
    if (err)
      res.render('error', { error: err });
    else
      res.json(snaps);
  });
});

// CURRENTLY used way of getting snaps
// GET snaps in a certain box (BOX)
router.get('/snaps/:sw_long/:sw_lat/:nw_long/:nw_lat', function(req, res, next) {
  Snap.find({
    loc: {
      $geoWithin: {
        $box: [
          [req.params.sw_long, req.params.sw_lat],
          [req.params.nw_long, req.params.nw_lat]
        ]
      }
    }
  }, function(err, snaps) {
    if (err)
      res.render('error', { error: err });
    else
      res.json(snaps);
  });
});

// POST to like a snap
router.post('/snap/:id/like', function(req, res, next) {
  // Check if user has liked 

  if (req.cookies[req.params.id] != null) {
    // Get Snap and increase like by 1
    Snap.findOne({'_id': req.params.id}, function(err, snap) {
      if (err) {
        res.render('error', { error: err });
        return;
      } else {
        req.cookie(req.params.id, 'liked');
        res.json(snap);
      }
    });
  } else {
    res.json({ message: "You already liked this"});
  }
});

module.exports = router;
