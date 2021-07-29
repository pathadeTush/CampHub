const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

//------- mongoose setup ------------
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error!"));
db.once("open", () => {
  console.log("Database connected");
});
//----------------------------------------
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '60fdabdc589c842919f10f38', // object id of rohit 
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      //images: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odio eaque blanditiis porro cupiditate! Natus debitis modi praesentium rerum. Laudantium similique sint ipsam! Sint odio molestiae officia accusamus quibusdam voluptatum sequi!",
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude, 
          cities[random1000].latitude],
      },
      images: []
    });
    await camp.save();
  }
}

seedDB().then(() => {
  // mongoose.connection.close();
  db.disconnect();
})