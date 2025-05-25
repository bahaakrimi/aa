const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bahaakrimi145@gmail.com',
        pass: 'ifpo icxo vyun puui'  
    }
});

const sendEmail = (to, subject, text, html) => {
    const mailOptions = {
        from: 'bahaakrimi145@gmail.com',
        to: 'bahaakrimi145@gmail.com',
        subject,
        text: 'Nouvelle commande reçue',
        html
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email envoyé :', info.response);
            return info;
        })
        .catch(error => {
            console.error('Erreur envoi mail :', error);
            throw error;
        });
};

module.exports = sendEmail;
