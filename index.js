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
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection('users')

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

        // Delete Order 
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await purchasedCollection.deleteOne({
              _id: ObjectId(req.params.id),
            });
            res.json(result);
            console.log(result)
        })

        // Delete Car 
        app.delete('/deleteCar/:id', async (req, res) => {
            const result = await carsCollection.deleteOne({
              _id: ObjectId(req.params.id),
            });
            res.json(result);
            console.log(result)
        })

        // Get My Orders 
         app.get("/myOrders/:email", async (req, res) => {
           const result = await purchasedCollection
             .find({ userEmail: req.params.email })
             .toArray();
           res.send(result);
         });

        //Update Status
        app.put("/updateStatus/:id", async (req, res) => {
          const id = req.params.id;
          const newStatus = req.body;
          const filter = {_id: ObjectId(id)};
          const options = {upsert: true};
          const updateStatus = {
              $set: {
                  status: newStatus[0]
              }
            }
          const result = await purchasedCollection.updateOne(filter, updateStatus, options);
          console.log(result);

          res.json(result)
        });

        // Save user 
        app.post('/users', async(req, res) => {
          const user = req.body;
          console.log(user)
          const result = await usersCollection.insertOne(user);
          res.json(result);
        })

        // Upsert User 
        app.put('/users', async(req, res) => {
          const user = req.body;
          console.log(user);
          const filter = {email: user.email};
          const options = {upsert: true};

          const updateDoc = {$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })

        // Make Admin 
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.json(result);
        });

        // Query of Admin 
        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin: isAdmin})
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