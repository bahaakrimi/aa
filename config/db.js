const mongoose = require("mongoose"); 

module.exports.connectToMongoDb = async () => {
  mongoose.set("strictQuery", false);
  mongoose.connect("mongodb://localhost:27017/backendfev")
    .then(
        () => { console.log("connnect to db") }
    )
    .catch((err) => {
      console.log(err);
    });
};