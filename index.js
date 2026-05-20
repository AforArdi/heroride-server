require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async () => {
  try {
    await client.connect();

    const carsCollection = client.db("HERO_RIDE_DB").collection("cars");
    const reviewsCollection = client.db("HERO_RIDE_DB").collection("reviews");
    const addedCarsCollection = client.db("HERO_RIDE_DB").collection("addedCars");
    const myBookingsCollection = client.db("HERO_RIDE_DB").collection("myBookings");

    // getting all cars data
    app.get('/cars', async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.json(result);
    });

    // getting single car data
    app.get('/cars/:id', async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // getting popular 6 cars data
    app.get('/popular', async (req, res) => {
      const result = await carsCollection.find().limit(6).toArray();
      res.json(result);
    });

    // getting all reviews data
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.json(result);
    });

    // getting user's added cars
    app.get('/added-cars/:userId', async (req, res) => {
      const { userId } = req.params;
      const result = await addedCarsCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // getting my bookings
    app.get('/my-bookings/:userId', async (req, res) => {
      const { userId } = req.params;
      const result = await myBookingsCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // reviews post
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    // addedCars post
    app.post('/added-cars', async (req, res) => {
      const addedCar = req.body;
      const result = await addedCarsCollection.insertOne(addedCar);
      res.json(result);
    });

    // myBookings post
    app.post('/my-bookings', async (req, res) => {
      const data = req.body;
      const result = await myBookingsCollection.insertOne(data);
      res.json(result);
    })

    // delete my bookings
    app.delete('/my-bookings/:carId', async (req, res)=>{
      const {carId} = req.params;
      const query = { _id: new ObjectId(carId) };
      const result = await myBookingsCollection.deleteOne(query);
      res.json(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running fine!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})