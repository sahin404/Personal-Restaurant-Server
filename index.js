const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
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


    //Token verify middleware

    const verifyToken = (req,res,next)=>{
      if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden access'});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(403).send({message:'forbidden access'})
        }
        else{
          req.decoded = decoded;
          next();
        }
      })
      
    }

    // Admin verify Middleware
    const verifyAdmin = async(req,res,next)=>{
      const email  = req.decoded.email;
      const query = {email:email};
      const user = await usersCollection.findOne(query);
      let admin = false;
      if(user?.role==='admin'){
        admin = true;
      }
      if(admin){
        next();
      }
      else{
        return res.status(403).send({message:'forbidden-access'});
      }
    }

    // Admin Verify 
    app.get('/users/admin/:email',verifyToken, async(req,res)=>{
      const email = req.params.email;
      if(email!==req.decoded.email){
        return res.status(403).send({message: 'anuthorized Access'})
      }
      const query = {email:email};
      const result = await usersCollection.findOne(query);
      let admin = false;
      if(result){
        admin = result?.role==='admin';
      }
      res.send({admin})
    })

    // User Related API

    app.get('/users',verifyToken,verifyAdmin, async (req, res) => {

      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    })


    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })


    app.patch('/users/admin/:id', verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // console.log(id);
      const updateDocument = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(query, updateDocument);
      res.send(result);
    })


    // Jwt related API
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'});
      res.send({token});
    })


    //Menu and Carts related API
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    app.post('/carts', async (req, res) => {
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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












app.get('/', (req, res) => {
  res.send('Boss is runnnig');
})
app.listen(port, () => {
  console.log('boss is stting on port: ', port);
})