var nodemailer = require('nodemailer')
var ejs = require('ejs');
var path = __dirname.concat("\\mails\\found\\foundcar.ejs");
var read = require('fs').readFileSync;

const sendMail = (coords, timestamp, email, vehicle) => {
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls : { rejectUnauthorized: false },
        auth: {
            user: "omniplate.notification@gmail.com",
            pass: "lwntyrzdrhjcbzjt"
        }
    });

    let html2send = ejs.compile(read(path, 'utf8'), { filename: path })({
        vehicle: Object.keys(vehicle).map(k => vehicle[k]).join(" "),
        location: Object.keys(coords).map(k => coords[k]).join(" "),
        timestamp: new Date(timestamp).toISOString(),
    });
    
    let mailOptions = {
        from: "<OmniPlate> omniplate.notification@gmail.com",
        to: email,
        subject: "We've received a tip about your car!",
        html: html2send
    }

    mailTransporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
            
        } else {
            console.log(`Mail sent to ${email}`)
            console.log(info);
                    
        }
    })
}

module.exports = { sendEmail };