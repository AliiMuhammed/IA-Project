const router = require("express").Router();
const conn = require("../db/dbConnection")
const authorized = require("../middleware/authorize")
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const { query } = require("express");
const upload = require("../middleware/uploadImages");
const util = require("util");
const fs = require("fs");

// CREATE INSTRACTOR
// router.post("",
//  admin,
//  upload.single("image"),
//   body("name")
//   .isString()
//   .withMessage("Please enter a valid Instractor name"),
// //   body("description")
// //   .isString()
// //   .withMessage("Please enter a valid description")
// //   .isLength({ min: 20 })
// //   .withMessage("Description must be at least 20 characters"),
//    async (req, res) => {
//     try{
//     const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({errors: errors.array()});
//         }
//     if(!req.file){
//         return res.status(400).json({errors: ["Please upload an image"]});
//     }
//     const instractor = {
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         phone: req.body.phone,
//         type: req.body.type,
//         image_url: req.file.filename,
//     };
//     const query = util.promisify(conn.query).bind(conn);// transfer query mysql to --> promise to use (await,async)
//     await query ("insert into users set ?",instractor)
//     res.status(200).json({
//         msg:"Instractor created",
//     });
// } catch(err){
//     res.status(500).json(err);
// }
// });

// UPDATE Course
router.put("/:id",// params
 admin,
 upload.single("image"),
  body("name")
  .isString()
  .withMessage("Please enter a valid course name"),
//   body("description")
//   .isString()
//   .withMessage("Please enter a valid description")
//   .isLength({ min: 20 })
//   .withMessage("Description must be at least 20 characters"),
   async (req, res) => {
    try{
    const query = util.promisify(conn.query).bind(conn);// transfer query mysql to --> promise to use (await,async)
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
    // check if instractor Exisit
    const instractor = await query ("select * from users where id =?",[req.params.id])
    if(!instractor[0]){
        return res.status(400).json({errors: ["Instractor not found"]});
    }

    const instractorObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        type: req.body.type,
    };

    if(req.file){
        instractorObj.image_url = req.file.filename;
        fs.unlinkSync('./upload' + instractor[0].image_url)
    }


    await query ("update users set? where id =?",[instractorObj, instractor[0].id])
    res.status(200).json({
        msg:"Instractor updated",
    });


} catch(err){
    res.status(500).json(err);
}
});

// DELETE COURSE
router.delete("/:id",// params
 admin,
   async (req, res) => {
    try{
    // check if course Exisit
    const query = util.promisify(conn.query).bind(conn);// transfer query mysql to --> promise to use (await,async)
    const instractor = await query ("select * from users where id =?",[req.params.id])
    if(!instractor[0]){
        return res.status(400).json({errors: ["Instractor not found"]});
    }


    fs.unlinkSync('./upload' + instractor[0].image_url)

    await query ("delete from users  where id =?",[instractor[0].id])
    res.status(200).json({
        msg:"Instractor Delete Success",
    });


} catch(err){
    res.status(500).json(err);
}
});


// LIST & SEARCH
router.get("", async (req, res) => { 
    const query = util.promisify(conn.query).bind(conn);// transfer query mysql to --> promise to use (await,async)
    let search = "";
    if(req.query.search){
        search = `where name like '%${req.query.search}%' or description like '%${req.query.description}%'`
    }
    const instractors = await query(`select * from users ${search}`)
    instractors.map(instractor => {
        instractor.image_url = "http://" + req.hostname + ':4004/' + instractor.image_url;
    })
    res.status(200).json({
        instractors,
    });
});

// SHOW COURSE  
router.get("/:id", async (req, res) => {
    const query = util.promisify(conn.query).bind(conn);// transfer query mysql to --> promise to use (await,async)
    const instractor = await query ("select * from users where id =?",[req.params.id])
    if(!instractor[0]){
        return res.status(400).json({errors: ["Instractor not found"]});
    }
    instractor[0].image_url = "http://" + req.hostname + ':4004/' + instractor[0].image_url;

    res.status(200).json(instractor[0]);
});

module.exports = router;