const express = require('express')
const app = express()
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// MiddleWare 
app.use(cors());
app.use(express.json());

// MongoDB Database Info 
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jry2k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function run(){
    try{
        await client.connect();
        const database = client.db('maxWheels');
        const purchasedCollection = database.collection('purchased');
        const carsCollection = database.collection('car');
        const reviewsCollection = database.collection("reviews")

        // Post New Car 
        app.post('/cars', async(req, res) => {
          const post = req.body;
          const result = await carsCollection.insertOne(post);
          res.json(result);
        });

        // Get Cars on the Client Side 
        app.get('/cars', async(req, res) => {
          const result = await carsCollection.find({}).toArray();
          res.json(result);
        });

        // Get single car data 
        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.send(result);
        })

        // Get Car Data for Home Page 
        app.get('/featuredCars', async(req, res) => {
          const cursor = carsCollection.find({});
          const result = await cursor.limit(6).toArray();
          res.json(result);
        });

        // Post Review 
        app.post('/reviews', async(req, res) => {
          const review = req.body;
          const result = await reviewsCollection.insertOne(review);
          res.json(result);
        });

        // Get Reviews 
        app.get('/reviews', async(req, res) => {
          const result = await reviewsCollection.find({}).toArray();
          res.json(result);
        })


        // Post Purchased Data 
        app.post('/purchased', async(req, res) => {
            const purchase = req.body;
            const result = await purchasedCollection.insertOne(purchase);
            res.json(result)
        })

        // Get Purchased Data 
        app.get('/purchased', async(req, res) => {
          const result = await purchasedCollection.find({}).toArray();
          res.json(result);
        })
    }finally{
        // await client.close();
    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Max Wheels is running')
})

app.listen(port, () => {
  console.log(`listening from ${port}`)
})