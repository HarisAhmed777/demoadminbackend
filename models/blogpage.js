const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  firstpara: {
    type: String,
    required: true,
  },
  secondpara: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});




const BlogModel = mongoose.model("Blog", blogSchema); 
module.exports = BlogModel;