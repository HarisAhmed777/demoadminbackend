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
const multer = require("multer");
const BlogModel =  require('./models/blogpage');
const FeedbackModel =  require('./models/feedback')
const PackageModel =  require('./models/packagemodel')
const fs = require("fs");
const path = require('path');

const app = express();

app.use(cors({
    origin: ["https://cerulean-naiad-7b9492.netlify.app","http://localhost:5173"],
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
        res.json({ status: "Success", name: user.email, role: user.role, token ,id:user._id});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });



// Blog upload route
app.post("/blogpage", upload.single("image"), async (req, res) => {
  try {
    const { title,firstpara,secondpara } = req.body;
    const image = req.file ? req.file.path : null;

    const blog = new BlogModel({
      title,
      firstpara,
      secondpara,
      image,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Error saving blog post" });
  }
});
app.get('/allblogs', async (req, res) => {
    try {
      const blogs = await BlogModel.find(); // Await the Mongoose query
      res.json(blogs);
    } catch (error) {
      console.log("Sending error in blogs", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.use("/packageimages", express.static(path.join(__dirname, "packageimages")));

// Configure multer for file uploads
const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "packageimages/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const packageimages = multer({ storage: storages });

app.post("/packageaddpage", packageimages.single("image"), async (req, res) => {
  try {
    const {packagename,duration,location,cost,catogory,maxdays } = req.body;
    const image = req.file?req.file.path.replace(/\\/g, "/") : null;

    const package = new PackageModel({
      packagename,
      duration,
      location,
      cost,
      catogory,
      maxdays,
      image,
    });

    await package.save();
    res.status(201).json(package);
  } catch (error) {
    res.status(500).json({ error: "Error saving package post" });
  }
});



app.get('/allpackages', async (req, res) => {
    try {
      const packages = await PackageModel.find(); // Await the Mongoose query
      res.json(packages);
    } catch (error) {
      console.log("Sending error in packages", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/packages/:id', async (req, res) => {
    try {
      const packageId = req.params.id;
      const updatedData = req.body; // Assuming the updated package data is in the request body
      const updatedPackage = await PackageModel.findByIdAndUpdate(packageId, updatedData, { new: true });
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: 'Error updating package', error });
    }
  });
  
  app.post('/packages/:id', async (req, res) => {
    try {
      const packageId = req.params.id;
  
      // Find the package to get the image path
      const package = await PackageModel.findById(packageId);
      if (!package) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      // Delete the image file
      const imagePath = path.join(__dirname, '', package.image); // Adjust the path as needed
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        } else {
          console.log('Image file deleted successfully');
        }
      });
  
      // Delete the package from the database
      await PackageModel.findByIdAndDelete(packageId);
  
      res.json({ message: 'Package and image deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting package', error });
    }
  });
  
app.get('/countsofall', async (req, res) => {
    try {
        const bookingsCount = await BookingModel.countDocuments({});
        const usersCount = await UserModel.countDocuments({});
        const packageRequestsCount = await Form.countDocuments({});

        // Calculate the total amount
        const totalAmountResult = await BookingModel.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$totalamount" } } }
        ]);

        const totalAmount = totalAmountResult[0]?.totalAmount || 0;

        res.json({
            bookingsCount,
            usersCount,
            packageRequestsCount,
            totalAmount
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
        console.log("hi");
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

app.post('/feedback', async (req, res) => {
    const { name, email, feedback } = req.body;

    if (!name || !email || !feedback) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newFeedback = new FeedbackModel({ name, email, feedback });
        await newFeedback.save();
        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback', error });
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
