const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
// const campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error: '));
db.once('open', () => {
  console.log('Database Connection Established!');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '628ee8348d97eca46e52bd0e',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Non reprehenderit magnam deserunt, deleniti natus soluta incidunt obcaecati iure. Voluptates totam illum voluptas quibusdam ratione aliquam aliquid. Unde ab quas reiciendis.',
      price,
      images: [
        {
          url: 'https://res.cloudinary.com/warrior100/image/upload/v1653806206/YelpCamp/za6v1vgnhenuaqn4qdcs.jpg',
          filename: 'YelpCamp/za6v1vgnhenuaqn4qdcs',

        },
        {
          url: 'https://res.cloudinary.com/warrior100/image/upload/v1653806225/YelpCamp/btc66jnvhddx0ceyrzwk.jpg',
          filename: 'YelpCamp/btc66jnvhddx0ceyrzwk',

        }
      ]
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
