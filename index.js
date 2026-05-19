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

const run =async ()=>{
    try{
        await client.connect();

        const carsCollection = client.db("HERO_RIDE_DB").collection("cars");
        const reviewsCollection = client.db("HERO_RIDE_DB").collection("reviews");

        // getting all cars data
        app.get('/cars', async (req, res) => {
          const result = await carsCollection.find().toArray();
          res.json(result);
        });

        // getting single car data
        app.get('/cars/:id', async (req, res) => {
          const {id} = req.params;
          const result = await carsCollection.findOne({_id: new ObjectId(id)});
          res.json(result);
        });

        // getting popular 6 cars data
        app.get('/popular', async (req, res) => {
          const result = await carsCollection.find().limit(6).toArray();
          res.json(result);
        });

        // inserting reviews data
        app.post('/reviews', async (req, res) => {
          const review = req.body;
          const result = await reviewsCollection.insertOne(review);
          res.json(result);
        });
        
        // getting all reviews data
        app.get('/reviews', async (req, res) => {
          const result = await reviewsCollection.find().toArray();
          res.json(result);
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally{
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