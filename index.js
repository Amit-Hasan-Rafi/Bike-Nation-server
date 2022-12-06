const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(cors());
app.use(express.json())

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.gzgfqcq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const bikesCollections = client.db('Bike-Nation').collection('Bikes')
        const usersCollections = client.db('Bike-Nation').collection('users')
        const bookingsCollections = client.db('Bike-Nation').collection('bookings')
        const sellPostsCollections = client.db('Bike-Nation').collection('sell-posts')


        //bookings api //
        app.post('/bookings', async (req, res) => {
            const bookings = req.body
            const query = { Bike_Name: bookings.Bike_Name }
            const alreaybooked = await bookingsCollections.findOne(query)
            if (alreaybooked?.Bike_Name === bookings?.Bike_Name) {
                const message = 'You Already Booked this bike'
                return res.send({ acknowledge: false, message })
            }
            else {
                const result = await bookingsCollections.insertOne(bookings)
                res.send(result)
            }
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { Email: email };
            const bookings = await bookingsCollections.find(query).toArray();
            res.send(bookings);
        });
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingsCollections.deleteOne(query)
            res.send(result)
        })
        //users api //
        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await usersCollections.insertOne(users)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const users = await usersCollections.find(query).toArray()
            res.send(users)
        })
        app.get('/users/buyer', async (req, res) => {
            const query = { category:'Buyer' }
            const buyer = await usersCollections.find(query).toArray()
            res.send(buyer)
        })
        app.get('/users/seller', async (req, res) => {
            const query = { category:'Seller' }
            const buyer = await usersCollections.find(query).toArray()
            res.send(buyer)
        })
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const category = req.body.category
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    category: 'admin'
                }
            }
            const result = await usersCollections.updateOne(query, updateDoc)
            res.send(result)
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollections.findOne(query);
            res.send({ isBuyer: user?.category === 'Buyer' });
        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollections.findOne(query);
            res.send({ isSeller: user?.category === 'Seller' });
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollections.findOne(query);
            res.send({ isAdmin: user?.category === 'admin' });
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollections.deleteOne(query)
            res.send(result)
        })

        //SellPost Api
        app.post('/sellposts', async (req, res) => {
            const sellposts = req.body
            const result = await sellPostsCollections.insertOne(sellposts)
            res.send(result)
        })
        app.get('/sellposts', async (req, res) => {
            const query = {}
            const sellPosts = await sellPostsCollections.find(query).toArray()
            res.send(sellPosts)
        })
        app.get('/sellposts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const sellPosts = await sellPostsCollections.findOne(filter)
            res.send(sellPosts)
        })
        app.delete('/sellposts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await sellPostsCollections.deleteOne(query)
            res.send(result)
        })
        app.patch('/sellposts/:id', async (req, res) => {
            const id = req.params.id
            const available = req.body.available
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    available: 'Sold'
                }
            }
            const result = await sellPostsCollections.updateOne(query, updateDoc)
            res.send(result)
        })

        app.patch('/sellposts/advertised/:id', async (req, res) => {
            const id = req.params.id
            const advertised = req.body.advertised
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    advertised: 'advertised'
                }
            }
            const result = await sellPostsCollections.updateOne(query, updateDoc)
            res.send(result)
        })
        app.get('/advertised', async (req, res) => {
            const query = {advertised : 'advertised'}
            const result = await sellPostsCollections.find(query).toArray()
            res.send(result)
        })

        //category api //
        app.get('/category', async (req, res) => {
            const query = {}
            const bikes = await bikesCollections.find(query).toArray()
            res.send(bikes)
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const bikes = await bikesCollections.findOne(filter)
            res.send(bikes)
        })


        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const user = await usersCollections.findOne(query);
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.JWT_TOKEN, { expiresIn: '90h' })
        //         return res.send({ accessToken: token });
        //     }
        //     res.status(403).send({ accessToken: '' })
        // });
    }
    finally {

    }
}

run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('NODE.js running')
})

app.listen(port, () => {
    console.log(`port running ${port}`)
})