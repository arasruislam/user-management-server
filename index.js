const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.w00ka8a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userManager = client.db("userManagerDB").collection("managers");

    app.get("/users", async (req, res) => {
      const result = await userManager.find().toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const result = await userManager.findOne({
        _id: new ObjectId(req.params.id),
      });

      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const result = await userManager.insertOne(req.body);
      res.send(result);
    });

    app.put("/users/:id", async (req, res) => {
      const updatedUser = req.body;
      const filter = { _id: new ObjectId(req.params.id) };
      const options = { upsert: true };

      const updatedDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          gender: updatedUser.gender,
          status: updatedUser.status,
        },
      };

      const result = await userManager.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const result = await userManager.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The User Management Server Running");
});

app.listen(port, () => {
  console.log(`The Server Running on port: ${port}`);
});
