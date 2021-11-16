var express = require('express');
var router = express.Router();
var axios = require('axios').default;
var reports = require('../reports');
const { generateRandomPlate, saveReports } = require('../utils/utils');
var nodemailer = require('nodemailer')
var ejs = require('ejs');
var join = require('join');
var path = __dirname.concat("\\mails\\found\\foundcar.ejs");
var read = require('fs').readFileSync;

router.post("/generate", (req, res) => {
    let users = [
        {
            "name": "Christopher Ortega",
            "email": "chrortegita@gmail.com",
            "phone": "+5213111228981"
        },
        {
            "name": "Luis Garciaa",
            "email": "chrortegita@gmail.com",
            "phone": "+5213111228981"
        },
        {
            "name": "Oscar Del Toro",
            "email": "chrortegita@gmail.com",
            "phone": "+5213111228981"
        },
        {
            "name": "Mayra Guajardo",
            "email": "chrortegita@gmail.com",
            "phone": "+5213111228981"
        },

    ];

    let rnd_plates = {}; // * Only for dev purposes to see which plates where generated
    for (let i = 0; i < req.body.plates; i++) {
        let max_reports = Math.floor(Math.random() * req.body.max_reports) + 1;
        let rnd_rep = {};
        
        // * Generate reports
        for (let j = 0; j < max_reports; j++) {
            rnd_rep[new Date().getTime()] = {
                "latitude": (Math.random() * 360) - 180,
                "longitude": (Math.random() * 360) - 180
            }
        }
        
        let rnd_plate = generateRandomPlate();
        let rnd_plate_info = {
            "hasReport": Math.random() > 0.85,
            "vehicle": {
                "brand": "Toyota", 
                "model": "Prius",
                "year": "2018",
                "color": "silver"
            },
            "owner": users[Math.floor(Math.random() * users.length)],
            "reports": rnd_rep,
        }   
        rnd_plates[rnd_plate] = rnd_plate_info;
        reports[rnd_plate] = rnd_plate_info;
    }

    saveReports(reports);
    return res.status(201).send(rnd_plates)
})

router.post("/:plate/alert", (req, res) => {  
    if (reports[req.params.plate] !== undefined) {
        
        reports[req.params.plate].hasReport = true;

        saveReports(reports);
        
        // TODO: Enviar notificacion robo de auto

        return res.status(201).send(reports[req.params.plate]);
    } else {
        return res.status(204).send({
            "message": "Plate number is not registered in our Database",
            "plate": req.params.plate
        });
    }
})

router.post("/:plate", (req, res) => {
    if (reports[req.params.plate] !== undefined) {
        
        reports[req.params.plate].reports[req.body.timestamp] = {
            ...req.body.coords
        };

        saveReports(reports);
        
        if (reports[req.params.plate].hasReport) {
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: "omniplate.notification@gmail.com",
                    pass: "lwntyrzdrhjcbzjt"
                }
            });

            let html2send = ejs.compile(read(path, 'utf8'), { filename: path })({
                vehicle: Object.keys(reports[req.params.plate].vehicle).map(k => reports[req.params.plate].vehicle[k]).join(" "),
                location: req.body.coords,
                timestamp: req.body.timestamp
            });
            
            let mailOptions = {
                from: ">OmniPlate> omniplate.notification@gmail.com",
                to: reports[req.params.plate].owner.email,
                subject: "We've received a tip about your car!",
                html: html2send
            }

            mailTransporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(201).send({
                        "reports": reports[req.params.plate].reports,
                        "err": err
                    });
                } else {
                    return res.status(201).send({
                        "reports": reports[req.params.plate].reports,
                        "mailInfo": info
                    });        
                }
            })



        } else {
            return res.status(201).send(reports[req.params.plate].reports);
        }

    } else {
        return res.status(204).send({
            "message": "Plate number is not registered in our Database",
            "plate": req.body.plate
        });
    }
    
    
})

router.get("/all", (req, res) => {
    return res.status(200).send(reports);
})
router.get("/:plate", (req, res) => {
    if (reports[req.params.plate] !== undefined) {
        return res.status(200).send({
            "message": "Plate number was found!",
            ...reports[req.params.plate],
        })
    } else {
        return res.status(204).send({
            "message": "Plate number is not registered in our Database",
            "plate": req.params.plate
        })
    }
})


module.exports = router;