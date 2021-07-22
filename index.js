const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID
require('dotenv').config();

const app = express()
app.use(express.static('categories'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({
    createParentPath: true
  }));


app.get('/', (req, res) => {
    res.send('everything is ok here')
})


const uri = `mongodb+srv://Bandhon_Ecommerce:Noor&62427@cluster0.zcphb.mongodb.net/badhon_ecommerce?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true })



client.connect(error => {
    const categoryCollection = client.db("bandhon_ecommerce").collection("categories")

    app.get('/get', (req, res) => {
        categoryCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })

    app.get('/get-categories', (req, res) => {
        categoryCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })

    app.patch('/add-brand/id',(req, res)=>{
        const id = req.query.id;
        const body = req.body;
        categoryCollection.updateOne(
            { _id: ObjectId(id) },
            {
              $set: {brands: body.brands},
            }
        )
        .then(result =>  res.send(result))
        .catch(err => console.log(err))
    })

    app.patch('/add-product/id',(req, res)=>{
        const id = req.query.id;
        const body = req.body;
        console.log(body)
        categoryCollection.updateOne(
            { _id: ObjectId(id) },
            {
            $set: {products: body.products},
            }
        )
        .then(result =>  res.send(result))
        .catch(err => console.log(err))
    })
})

client.connect(error => {
    const userDataCollection = client.db("bandhon_ecommerce").collection("user_data")

    app.get('/get-user-data', (req, res) => {
        userDataCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })

    app.post('/add-user-data', (req, res) => {
        const data = req.body
        userDataCollection.insertOne(data)
        .then(result => {
          res.send(result)
        })
        .catch(err => console.log(err))
    })

    app.patch('/add-cart-product/id',(req, res)=>{
        const id = req.query.id;
        const body = req.body;
        console.log(body, id)
        userDataCollection.updateOne(
            { _id: ObjectId(id) },
            {
            $set: {cartProducts: body},
            }
        )
        .then(result =>  res.send(result))
        .catch(err => res.send(err))
    })
})

client.connect(error => {
    const luckyWinnerCollection = client.db("bandhon_ecommerce").collection("lucky_winner_data")

    app.get('/get-lucky-winner-data', (req, res) => {
        luckyWinnerCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })

    app.post('/add-lucky-winner-data', (req, res) => {
        const data = req.body
        luckyWinnerCollection.insertOne(data)
        .then(result => {
          res.send(result)
        })
        .catch(err => console.log(err))
    })
})

client.connect(error => {
    const adminDataCollection = client.db("bandhon_ecommerce").collection("admin_mail")

    app.get('/get-admin-mail', (req, res) => {
        adminDataCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })
})

app.listen(process.env.PORT || 5000)