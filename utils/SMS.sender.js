import twilio from 'twilio';

const SendSMS = async (userMobile,OTP) => {
    try {
         const accountSid = process.env.TWILIO_ACOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = twilio(accountSid, authToken);

        // Send SMS
        client.messages
            .create({
                body: `Your OTP is ${OTP}`,
                from: '56565656', // Twilio number
                to: userMobile   // User's mobile number
            })
            .then(message => {
                console.log('SMS sent:', message.sid);
            })
            .catch(error => {
                console.error('SMS failed:', error);
            });
    } catch (error) {
        
    }
   
}

export default SendSMS;
