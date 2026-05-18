require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        // getting all cars data
        app.get('/cars', async (req, res) => {
          const result = await carsCollection.find().toArray();
          res.json(result);
        });
        // getting popular 6 cars data
        app.get('/popular', async (req, res) => {
          const result = await carsCollection.find().limit(6).toArray();
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