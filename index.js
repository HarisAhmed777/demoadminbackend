require("dotenv").config();
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const UserModel = require('./models/user');
const BookingModel =  require('./models/bookings');
const Form =  require('./models/formmodel');
const Offer = require ('./models/offer');

const path = require('path');

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.error("Error in connecting db", e);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No record exists" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "The password is incorrect" });
        }
        const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);
        res.json({ status: "Success", name: user.email, role: user.role, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


  
app.get('/countsofall', async (req, res) => {
    try {
        const bookingsCount = await BookingModel.countDocuments({});
        const usersCount = await UserModel.countDocuments({});
        const packageRequestsCount = await Form.countDocuments({});
        console.log(bookingsCount,usersCount,packageRequestsCount);

        res.json({
            bookingsCount,
            usersCount,
            packageRequestsCount
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get('/allusers', async (req, res) => {
    try {
        const allusers = await UserModel.find();
        res.json(allusers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/allbookings', async (req, res) => {
    try {
        const allbookings = await BookingModel.find();
        res.json(allbookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/allforms', async (req, res) => {
    try {
        const allbookings = await Form.find();
        res.json(allbookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/allfeedback', async (req, res) => {
    try {
        const allfeedback = await FeedbackModel.find();
        res.json(allfeedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/packagaereq', async (req, res) => {
    try {
        const packagaereq = await PurchasePackageModel.find();
        res.json(packagaereq);
    } catch (error) {
        console.error("Error fetching package requests:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/offers', async (req, res) => {
    try {
      const offers = await Offer.find();
      res.json(offers);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update an offer
  app.put('/offers/:id', async (req, res) => {
    try {
      const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(offer);
    } catch (error) {
      res.status(500).send(error);
    }
  })
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"/frontend/build/index.html"))
    res.sendFile(path.join(__dirname,"/backend/build/index.html"))
})



app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  }); 
  
app.listen(process.env.PORT, () => {
    console.log("Server is connected", process.env.PORT);
});
