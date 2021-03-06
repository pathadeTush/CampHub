const express = require('express');
const router = express.Router({ mergeParams: true }); // use to merge params in reviews constant see in app.js routes secrion
const Campground = require("../models/campground");
const Review = require('../models/reviews');
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware');

// ------------------ Routes --------------------------------
// post a review
router.post('', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;

//------------ middleware -------------------------------------
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(ele => ele.message).join(',')
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }
// }