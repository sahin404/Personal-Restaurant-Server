const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000

//Middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vm21m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db('pizzarant').collection('menu');
    const cartCollection = client.db('pizzarant').collection('carts');
    const usersCollection = client.db('pizzarant').collection('users');


    // User Related API

    app.get('/users', async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req,res)=>{
      const userInfo = req.body;
      const result  = await usersCollection.insertOne(userInfo);
      res.send(result);
    })


    app.delete('/users/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })


    //Menu and Carts related API
    app.get('/carts', async(req,res)=>{
      const email = req.query.email;
      const query = {userEmail: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/menu', async(req,res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result);
    })

    app.post('/carts', async(req,res)=>{
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result);
    })

    app.delete('/carts/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = cartCollection.deleteOne(query);
      res.send(result);
    })












    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
 
} finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);












app.get('/', (req,res)=>{
    res.send('Boss is runnnig');
})
app.listen(port,()=>{
    console.log('boss is stting on port: ', port);
})