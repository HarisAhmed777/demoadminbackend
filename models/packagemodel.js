const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  img: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  guest: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  mainpara: {
    type: String,
    required: true,
  },
  subpara: {
    type: String,
    required: true,
  },
  transportation: {
    type: String,
    required: true,
  },
  day1city: {
    type: String,
    required: true,
  },
  day1: {
    type: String,
    required: true,
  },
  day1plan: [
    {
      NTR: { type: String },
      Lumbni: { type: String },
      DrAmbedkarStatue: { type: String },
      TelenganaMartyrsMemorial: { type: String },
      SalarjungMuseum: { type: String },
      Charminar: { type: String },
      MeccaMasjid: { type: String },
    }
  ],
  day2city: {
    type: String,
  },
  day2mainpara: {
    type: String,
  },
  day2plan: {
    type: String,
  },
  packagecostperstudent: {
    type: String,
  },
  foodplan: {
    type: String,
  },
  groupsize: {
    type: String,
  },
  perheadcost: {
    type: String,
  },
  costincludes: [
    {
      accomodation: { type: String },
      assistance: { type: String },
      complimentary: { type: String },
      sharingplan: { type: String },
      meals: { type: String },
    }
  ],
  costexcludes: [
    {
      fare: { type: String },
      portage: { type: String },
      laundry: { type: String },
      cam: { type: String },
    }
  ],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const PackageModel = mongoose.model("Package", packageSchema);

module.exports = PackageModel;
