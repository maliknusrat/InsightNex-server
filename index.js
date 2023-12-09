const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.dhjafvg.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const userCollection = client.db('InsightNex').collection('User')
    const assetsCollection = client.db('InsightNex').collection('assets')
    const customAssetCollection = client.db('InsightNex').collection('customAssets')
    const requestAssetCollection = client.db('InsightNex').collection('requestAssets')
    
    app.post('/employee',async(req,res)=>{
        const newEmployee = req.body;
        const result = await userCollection.insertOne(newEmployee);
        res.send(result)
    })

    app.post('/admin',async(req,res)=>{
        const newAdmin = req.body;
        const result = await userCollection.insertOne(newAdmin);
        res.send(result)
    })

    app.get('/employee/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {email:id}
        const result = await userCollection.findOne(query)
        res.send(result);
    })

    app.get('/allUsers', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    //add employee

    app.get('/findEmployee', async (req, res) => {
      const allUsers = await userCollection.find().toArray();
      const result = allUsers.filter(user => user.type == 'employee');
      res.send(result);
    })

    app.put('/addEmployeeToAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { email:id };
      const options = { upsert: true };
      const addEmployee = {
        $push: {
          myEmployee: body
        },
        $inc: {
          selectedMember : -1
        }
      }
      const result = await userCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    app.put('/addAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { email:id };
      const options = { upsert: true };
      const addEmployee = {
        $set: {
          myAdmin: body.yourAdmin
        }
      }
      const result = await userCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    // my employee

    app.put('/removeEmployeeToAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { email:id };
      const options = { upsert: true };
      const addEmployee = {
        $pull: {
          myEmployee: body
        },
        $inc: {
          selectedMember : 1
        }
      }
      const result = await userCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    app.put('/removeAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { email:id };
      const options = { upsert: true };
      const addEmployee = {
        $set: {
          myAdmin: "null"
        }
      }
      const result = await userCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    // update profile info

    app.put('/updateInfo/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { email: id };
      const options = { upsert: true };
      const addEmployee = {
        $set: {
          name: body.name,
          date: body.date
        }
      }
      const result = await userCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    // add assets

    app.post('/addAsset', async (req, res) => {
      const asset = req.body;
      const result = await assetsCollection.insertOne(asset);
      res.send(result);
    })

    app.get('/addAsset/:id', async (req, res) => {
      const id = req.params.id;
      const allAssets = await assetsCollection.find().toArray();
      const result = allAssets.filter(asset => asset.admin == id);
      res.send(result);
    })

    // custom asset
    app.get('/customAssetCollection/:id', async (req, res) => {
      const id = req.params.id;
      const customAssets = await customAssetCollection.find().toArray();
      const result = customAssets.filter(customAsset => customAsset.admin == id)
      res.send(result);
    })

    app.patch('/admin/approved/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Approved"
        }
      }
      const result = await customAssetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/admin/rejected/:id', async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Rejected"
        }
      }
      const result = await customAssetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // update asset

    app.get('/updateAsset/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assetsCollection.findOne(filter);
      res.send(result);
    })

    app.put('/updateAssetInfo/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const addEmployee = {
        $set: {
          productName: body.productName,
          productType: body.productType,
          quantity: body.quantity
        }
      }
      const result = await assetsCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    app.delete('/deleteAsset/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assetsCollection.deleteOne(filter);
      res.send(result);
    })


    // employee section

    // add custom req

    app.post('/customAsset', async (req, res) => {
      const body = req.body;
      const result = await customAssetCollection.insertOne(body);
      res.send(result);
    })

    // asset req

    app.post('/requestAsset', async (req, res) => {
      const body = req.body;
      const result = await requestAssetCollection.insertOne(body);
      res.send(result);
    })

    app.get('/requestAsset', async (req, res) => {
      const result = await requestAssetCollection.find().toArray();
      res.send(result);
    })

    // my team

    app.get('/myTeamInfo/:id', async (req, res) => {
      const id = req.params.id;
      let result;
      const allUser = await userCollection.find().toArray();
      for (let i = 0; i < allUser.length; i++){
        if (allUser[i].email == id) {
          reqUserAdmin = allUser[i].myAdmin;
          result = allUser.find(user => user.email == reqUserAdmin);
          break
        }
      }
      // console.log(result);
      res.send(result);
    })

    app.get('/customAssetCollection1/:id', async (req, res) => {
      const id = req.params.id;
      const allInfo = await customAssetCollection.find().toArray();
      const result = allInfo.filter(info => info.email == id);
      res.send(result);
    })

    app.get('/reqAssetCollection1/:id', async (req, res) => {
      const id = req.params.id;
      const allInfo = await requestAssetCollection.find().toArray();
      const result = allInfo.filter(info => info.employeeEmail == id);
      res.send(result);
    })

    app.delete('/cancelAssetReq/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await requestAssetCollection.deleteOne(filter);
      res.send(result);
    })

    // admin req asset

    app.get('/adminRequest/:id', async (req, res) => {
      const id = req.params.id;
      const allReq = await requestAssetCollection.find().toArray();
      const result = allReq.filter(req => req.admin == id);
      res.send(result);
    })

    app.patch('/admin/approvedReq/:id', async (req, res) => {
      const id = req.params.id;

      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Approved",
          approvalDate: day + '-' + month + '-' + year
        },
        $inc: {
          quantity : -1
        }
      }
      const result = await requestAssetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/admin/rejectedReq/:id', async (req, res) => {
      const id = req.params;

      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Rejected",
          rejectedDate: day + '-' + month + '-' + year
        }
      }
      const result = await requestAssetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/returnAsset/:id', async (req, res) => {
      const id = req.params;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Returned"
        },
        $inc: {
          quantity : 1
        }
      }
      const result = await requestAssetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/assetDetails/:id', async(req,res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestAssetCollection.findOne(query);
      res.send(result);
    })

    //employeHome
    app.get('/mycustomRequest123/:id', async(req,res)=> {
      const id = req.params.id;
      const allReq = await customAssetCollection.find().toArray();
      const result = allReq.filter(req => req.email == id);
      res.send(result);
    })


    //adminHome
    app.get('/mypendingRequest12345/:id', async(req,res)=> {
      const id = req.params.id;
      const allReq = await requestAssetCollection.find().limit(5).toArray();
      const result = allReq.filter(req => req.admin == id && req.status == 'pending');
      res.send(result);
    })

    app.get('/limitedStock/:id', async(req,res)=> {
      const id = req.params.id;
      const allReq = await assetsCollection.find().toArray();
      const result = allReq.filter(req => (req.admin == id && req.quantity<10));
      res.send(result);
    })

    app.get('/topMostItem/:id', async(req,res)=> {
      const id = req.params.id;
      const quantity = {date: 1}
      const allReq = await assetsCollection.find().sort(quantity).toArray();
      const result = allReq.filter(req => (req.admin == id));
      res.send(result);
    })

    app.put('/updateCustomAsset/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const addEmployee = {
        $set: {
          assetName:  body.assetName,
          assetType:  body.assetType,
          price:      body.price,
          needInfo:   body.needInfo,
          addInfo:    body.addInfo,
          status:     body.status,
          date:       body.date
        }
      }
      const result = await customAssetCollection.updateOne(filter, addEmployee, options);
      res.send(result);
    })

    app.get('/myPendingRequest123/:id', async(req,res)=> {
      const id = req.params.id;
      const allReq = await requestAssetCollection.find().toArray();
      const result = allReq.filter(req => req.employeeEmail == id);
      res.send(result);
    })

    app.get('/myPendingRequest1234/:id', async(req,res)=> {
      const id = req.params.id;
      const sort = {date: -1}
      const allReq = (await requestAssetCollection.find().sort(sort).toArray());
      const result = allReq.filter(req => req.employeeEmail == id);
      res.send(result);
    })

    app.get('/mycustomRequest123Details/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await customAssetCollection.findOne(filter);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res) => {
    res.send('InsightNex Server is Running')
})

app.listen(port,()=>{
    console.log(`InsightNex Server is Running on Port: ${port}`);
})
