const nodeMailer = require('nodemailer')

const sendEmail  = async(options)=>{
const transporter = nodeMailer.createTransport({
    host:process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth:{
        user:process.env.SMPT_USER,
        pass:process.env.SMPT_PASSWORD,
    }

})
const mailOptions = {
    from:'CineFlex support <support@cineflex.com>',
    to:options.email,
    subject:options.subject,
    text:options.message,
}
 transporter.sendMail(mailOptions)
 console.log("Sent mail",mailOptions)

}
module.exports = sendEmail