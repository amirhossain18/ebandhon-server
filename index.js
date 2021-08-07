const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { MongoClient } = require('mongodb');
const axios = require('axios');
const ImageKit = require('imagekit');
const ObjectId = require('mongodb').ObjectID
require('dotenv').config();

const app = express()
app.use(express.static('categories'))
// app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({
    createParentPath: true
  }));
//   const cors = require('cors');
  app.use(cors({
      origin: '*'
  }));

const imagekit = new ImageKit({
    urlEndpoint: 'https://ik.imagekit.io/ebnirpt9i8agxu',
    publicKey: 'public_5rRmOCN1vK/MI28l98iNzt8jNhQ=',
    privateKey: 'private_zhGSwTmOLTaSGUBkrvsduQ1ln1s='
});

app.get('/', (req, res) => {
    res.send('everything is ok here')
})

app.get('/auth', function (req, res) {
    var result = imagekit.getAuthenticationParameters();
    res.send(result);
});


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

    const userDataCollection = client.db("bandhon_ecommerce").collection("user_data")
    const adminDataCollection = client.db("bandhon_ecommerce").collection("admin_mail")

    // app.get('/get-admin-mail', (req, res) => {
    //     adminDataCollection.find({})
    //     .toArray((err, docs) => {
    //         res.send(docs)
    //         console.log(err)
    //     })
    // })

    app.get('/get-user-data/id', (req, res) => {
        const id = req.query.id;
        userDataCollection.find({})
        .toArray((err, docs) => {
            // var adminData = []
            var userData = docs.find(user => user.uid === id)
            if(userData){
                adminDataCollection.find({})
                .toArray((err, docs) => {
                    if(userData.email){
                        var admin = docs.find(data => data.email === userData.email)
                        // console.log(adminData)
                        if(admin){
                            userData.admin = true
                            res.send(userData)
                        }
                        else{
                            res.send(userData)
                        }
                    }
                    else{
                        res.send(userData)
                    }
                })
            }
            else{
                res.send({error: 'no data found'})
            }
            
        })
    })

    app.post('/add-user-data', (req, res) => {
        const data = req.body
        // console.log(data, 'data')
        userDataCollection.insertOne(data)
        .then(result => {
            res.send(result.ops[0])
        })
        .catch(err => console.log(err))
    })

    app.patch('/add-cart-product/id', (req, res)=>{
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

    const campaignCollection = client.db("bandhon_ecommerce").collection("campaign")

    app.get('/get-campaign-data', (req, res) => {
        campaignCollection.find({})
        .toArray((err, docs) => {
            res.send(docs)
            console.log(err)
        })
    })

    app.patch('/add-campaign-product/id', (req, res)=>{
        const id = req.query.id;
        const body = req.body;
        campaignCollection.updateOne(
            { _id: ObjectId(id) },
            {
            $set: {products: body},
            }
        )
        .then(result =>  res.send(result))
        .catch(err => res.send(err))
    })

    // register new user 
    app.post('/register-new-user', (req, res) => {
        const data = req.body;
        userDataCollection.find({})
        .toArray((err, docs) => {
            var alreadyRegistered = docs.find(doc => doc.email === data.email)
            if(alreadyRegistered) {
                res.send({error: 'This email is already registered.'})
            }
            else {
                userDataCollection.insertOne(data)
                .then(result => {
                    res.send(result.ops)
                })
                .catch(err => res.send({error: err.message}))
            }
        })
    })

    // email pass login 
    app.post('/email-pass-login', (req, res) => {
        const data = req.body
        userDataCollection.find({})
        .toArray((err, docs) => {
            var selectedUser = docs.find(user => user.email === data.email)
            if(selectedUser) {
                if(selectedUser.password) {
                    if(selectedUser.password === data.password) {
                        var newData = selectedUser
                        delete newData.password
                        delete newData._id
                        newData.isSignedIn = true
                        res.send({status: 'success', data: newData});
                    }
                    else {
                        res.send({error: 'Password did not match.'})
                    }
                }
                else {
                    res.send({error: 'There is no account with this method.'})
                }
            }
            else {
                res.send({error: 'No user found with this email.'})
            }
        })
    })

    const campaignDataCollection = client.db("bandhon_ecommerce").collection("campaign_data")

    // calling sManager payment gateway api
    app.post('/call-payment-gateway', (req, res) => {
        const client_id = '721182060'
        const client_secret = 'p3PO1ZmZWMM4msFBEubuwD2lTSQvXdu8zDIh2jJLfqjz9zTXJotl86JO6wHRck5zO6edx1KdML2XQkfu57r1a2s84jPIfdJYglebLnPWDFacDt9e4K1tHozd'
        var data = req.body;

        var config = {
        method: 'post',
        url: 'https://api.sheba.xyz/v1/ecom-payment/initiate',
        headers: { 
            'client-id': client_id,
            'client-secret': client_secret,
            'Accept': 'application/json', 
            'Content-Type': 'application/json'
        },
            data : data
        };

        axios(config)
        .then(function (response) {
            res.send(response.data);
        })
        .catch(function (error) {
            res.send(error);
        });
    })

    // to add the data in campaign sale pending database
    const campaignSalePendingCollection = client.db("bandhon_ecommerce").collection("campaign_sale_pending")

    // getting payment details from sManager
    app.post('/add-payment-details', (req, res) => {
        var paymentData = req.body;

        const client_id = '664520543'
        const client_secret = 'E2BC3ADUArXkyjpJJe6nWcBhDbLwBbY5EVQ1yfdwAXPafUnAZcysJm0zQ98Y4TQriiKcZQvQgRsZxlAaDeLZCK5msWzwLRWB4aPHNN1ZTH4qYuJoebSZnZdn'
        var axios = require('axios');
        var data = JSON.stringify({
        "transaction_id": paymentData.transactionId
        });

        var config = {
        method: 'get',
        url: 'https://api.dev-sheba.xyz/v1/ecom-payment/details',
        headers: { 
            'Accept': 'application/json', 
            'client-id': client_id, 
            'client-secret': client_secret,
            'Content-Type': 'application/json'
        },
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
    })

    // getting campaign payment details from sManager
    app.post('/add-campaign-payment-details', (req, res) => {
        var campaignPaymentData = req.body;

        const client_id = '664520543'
        const client_secret = 'E2BC3ADUArXkyjpJJe6nWcBhDbLwBbY5EVQ1yfdwAXPafUnAZcysJm0zQ98Y4TQriiKcZQvQgRsZxlAaDeLZCK5msWzwLRWB4aPHNN1ZTH4qYuJoebSZnZdn'
        var axios = require('axios');
        var data = JSON.stringify({
        // "transaction_id": campaignPaymentData.transactionId
        "transaction_id": '63fef5a2c65bf7a7a0c40c16be200bb'
        });

        var config = {
        method: 'get',
        url: 'https://api.dev-sheba.xyz/v1/ecom-payment/details',
        headers: { 
            'Accept': 'application/json', 
            'client-id': client_id, 
            'client-secret': client_secret,
            'Content-Type': 'application/json'
        },
            data : data
        };

        axios(config)
        .then(function (response) {
            if(response.data.message === "Successful"){
                if(response.data.data.payment_status != "pending"){
                    campaignDataCollection.find({})
                    .toArray((err, docs) => {
                        var CPCategoryData = docs.find(category => category.name === campaignPaymentData.productDetails.productCategory)
                        var addNewData = {...campaignPaymentData}
                        if(CPCategoryData.data){
                            addNewData.code = parseInt(CPCategoryData.data[CPCategoryData.data.length - 1].code) + 1
                            campaignDataCollection.updateOne(
                                { _id: ObjectId(CPCategoryData._id) },
                                {
                                $set: {data: [...CPCategoryData.data, addNewData]},
                                }
                            )
                            .then(result => {
                                userDataCollection.find({})
                                .toArray((err, docs) => {
                                    const userData = docs.find(user => user._id == campaignPaymentData.userId)
                                    if(userData.campaignProducts) {
                                        addNewData.status = "pending"
                                        userDataCollection.updateOne(
                                            { _id: ObjectId(userData._id) },
                                            {
                                            $set: {campaignProducts: [...userData.campaignProducts, addNewData]},
                                            }
                                        )
                                        .then(result => {
                                            campaignSalePendingCollection.insertOne(addNewData)
                                            .then(result => {
                                                res.send(result)
                                            })
                                            .catch(err => res.send(err))
                                        })
                                        .catch(err => res.send(err));
                                    }
                                    else {
                                        addNewData.status = "pending"
                                        userDataCollection.updateOne(
                                            { _id: ObjectId(userData._id) },
                                            {
                                            $set: {campaignProducts: [addNewData]},
                                            }
                                        )
                                        .then(result => {
                                            campaignSalePendingCollection.insertOne(addNewData)
                                            .then(result => {
                                                res.send(result)
                                            })
                                            .catch(err => res.send(err))
                                        })
                                        .catch(err => res.send(err));
                                    }
                                })
                            })
                            .catch(err => res.send(err))
                        }
                        else{
                            addNewData.code = 2021
                            campaignDataCollection.updateOne(
                                { _id: ObjectId(CPCategoryData._id) },
                                {
                                $set: {data: [addNewData]},
                                }
                            )
                            .then(result => {
                                userDataCollection.find({})
                                .toArray((err, docs) => {
                                    const userData = docs.find(user => user._id == campaignPaymentData.userId)
                                    addNewData.status = "pending"
                                    userDataCollection.updateOne(
                                        { _id: ObjectId(userData._id) },
                                        {
                                        $set: {campaignProducts: [addNewData]},
                                        }
                                    )
                                    .then(result => {
                                        campaignSalePendingCollection.insertOne(addNewData)
                                        .then(result => {
                                            res.send(result)
                                        })
                                        .catch(err => res.send(err))
                                    })
                                    .catch(err => res.send(err));
                                })
                            })
                            .catch(err => res.send(err))
                        }
                    })
                }
                else{
                    res.send({error: 'Something went wrong.'});
                }
            }
            else{
                res.send({error: "Something went wrong."})
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    })

})

app.listen(process.env.PORT || 5000)