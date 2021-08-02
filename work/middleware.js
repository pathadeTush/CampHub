const { campgroundSchema, reviewSchema } = require('./schemas'); // Joy schema
const ExpressError = require('./utils/ExpressError');
const Campground = require("./models/campground");
const Review = require('./models/reviews');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('Req User...', req.user)
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // url user want to visit before he wasn't logged in.
        req.flash('error', 'You must signed in first!');
        return res.redirect("/login");
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(ele => ele.message).join(',')
        throw new ExpressError(msg, 400);
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(ele => ele.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
   // console.log('review deleted!')
    next();
}
