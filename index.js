require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(
  new URL('http://localhost:3000/api/auth/jwks')
)

const verifyJwtToken = async (req, res, next) => {
  const header = req?.headers?.authorization;
  const token = header?.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, JWKS);
    // console.log(payload);
    next();
  }
  catch (error) {
    res.status(403).json({ message: 'Forbidden Access' })
  }
}

const run = async () => {
  try {
    await client.connect();

    const carsCollection = client.db("HERO_RIDE_DB").collection("cars");
    const reviewsCollection = client.db("HERO_RIDE_DB").collection("reviews");
    const myBookingsCollection = client.db("HERO_RIDE_DB").collection("myBookings");
    const addedCarsCollection = client.db("HERO_RIDE_DB").collection("myAddedCars");

    // getting all cars data
    app.get('/cars', async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.json(result);
    });

    // getting single car by id data
    app.get('/cars/:id', verifyJwtToken, async (req, res) => {
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
    app.get('/my-added-cars/:userId', verifyJwtToken, async (req, res) => {
      const { userId } = req.params;
      const result = await addedCarsCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // getting my bookings
    app.get('/my-bookings/:userId', verifyJwtToken, async (req, res) => {
      const { userId } = req.params;
      const result = await myBookingsCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // reviews post
    app.post('/reviews', verifyJwtToken, async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    // myAddedCars post
    app.post('/my-added-cars', verifyJwtToken, async (req, res) => {
      const data = req.body;
      const result = await addedCarsCollection.insertOne(data);
      res.json(result);
    });

    // myBookings post
    app.post('/my-bookings', verifyJwtToken, async (req, res) => {
      const data = req.body;
      const result = await myBookingsCollection.insertOne(data);
      res.json(result);
    })

    // update my added cars
    app.patch('/my-added-cars/:carId', verifyJwtToken, async (req, res) => {
      const { carId } = req.params;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(carId) };
      const updateCar = {
        $set: { ...updatedData }
      };
      const result = await addedCarsCollection.updateOne(filter, updateCar);
      res.json(result);
    });

    // delete my bookings
    app.delete('/my-bookings/:carId', verifyJwtToken, async (req, res) => {
      const { carId } = req.params;
      const query = { _id: new ObjectId(carId) };
      const result = await myBookingsCollection.deleteOne(query);
      res.json(result);
    })

    // delete my added cars
    app.delete('/my-added-cars/:carId', verifyJwtToken, async (req, res) => {
      const { carId } = req.params;
      const query = { _id: new ObjectId(carId) };
      const result = await addedCarsCollection.deleteOne(query);
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