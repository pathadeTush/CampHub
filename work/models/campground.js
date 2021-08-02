const mongoose = require("mongoose");
const { campgroundSchema } = require("../schemas");
const reviews = require("./reviews");
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
  url: String,
  filename: String,
})

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
})

// to include virtual method in schema
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'], // type has to be Point
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, opts);


// for popup text on map
CampgroundSchema.virtual('properties.popupMarkup').get(function () {
  return `<strong> <a href="/campgrounds/${this._id}" style="text-decoration: none;">${this.title}</a> </strong>
  <p>${this.description.substring(0, 50)}...</p>`
})



// in post middleware we have access to data that has been deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  //console.log('Campground item Deleted!!!')
  if (doc) {
    await reviews.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
