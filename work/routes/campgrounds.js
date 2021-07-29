const express = require('express');
const router = express.Router();
const Campground = require("../models/campground");
const campgrounds = require('../controllers/campgrounds');
const methodOverride = require('method-override');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

//------------- Routes -----------------------------------

router.route('/')
    // ALL campground route
    .get(catchAsync(campgrounds.index))
    // POST route for new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// Note: New Route should be before to id route. Because if it is below id route then when we go to /new route then it treates new as an id
// create a NEW campground
router.get('/new', isLoggedIn, campgrounds.renderNewCampground);

router.route('/:id')
    // SHOW a campground
    .get(catchAsync(campgrounds.showCampground))
    // PUT request for update 
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // DELETE campground 
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


// EDIT a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));

module.exports = router;