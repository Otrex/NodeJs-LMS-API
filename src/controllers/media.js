const { media : Media } = require("../config/database/models");

module.exports = {
  create : (req,res,next) => {
    if(req.file){
      Media.create({ url : req.file.filename })
        .then(media => {
          res.send({ success : true, message : "File saved", data : media });
        })
        .catch(next);
    } else {
      return res.status(400).send({ success : false, message : "File not found" });
    }
  }
};