
function SignupMail (name){
    return {
        subject: `Successfully Signup #${name}`,
        text: `Dear Solitaire Team,<br/><br/>

               We are pleased to inform you that a new order has been generated on the portal. The order details are attached to this email.<br/><br/>
                
               Please proceed with the necessary steps to fulfill this order at your earliest convenience.<br/><br/>
                
               Thank you for your prompt attention to this matter.<br/><br/>
                
               Best regards,<br/><br/>
               Team Solitaire`,
      };
};


function orderConfirmationFormate (name, orderNo){
    return {
        subject: `New Order Notification - Order #${orderNo}`,
        text: `Dear Solitaire Team,<br/><br/>

               We are pleased to inform you that a new order has been generated on the portal. The order details are attached to this email.<br/><br/>
                
               Please proceed with the necessary steps to fulfill this order at your earliest convenience.<br/><br/>
                
               Thank you for your prompt attention to this matter.<br/><br/>
                
               Best regards,<br/><br/>
               Team Solitaire`,
      };
};

function forgForgotPasswordFormate (name, baseURL, token) {
    return  {
        subject: `Reset Your Password`,
        text: `
              Dear ${name},
              
              We received a request to reset the password for your account. If you did not make this request, please ignore this email. Otherwise, you can reset your password using the link below:
              
              do not share token: ${baseURL + "/frontend/forget-password" + token}
              
              If you have any questions or need further assistance, please don't hesitate to contact our support team.
              
              Thank you,
              Team Solitaire`,
       };
  
};

function orderSummryFormate (number, date) {
    return {
        subject: `Solitaire Order Summary`,
        text : `
             Dear Solitaire Team,
             There were total of ${number} solitaires booked as on ${date} through online portal. 
             
             The details are attached in the mail.
             
             Best regards,
             Team Solitaire`
    }
};


function exportDiamondsSheetFormate (){
    return {
        subject: `Solitaire Order Summary`,
        text : `
             Dear Sourcing Team,
             
             The details are attached in the mail.
             
             Best regards,
             Team Solitaire`
    }
};


export default {
    SignupMail,
    orderConfirmationFormate,
    forgForgotPasswordFormate,
    orderSummryFormate,
    exportDiamondsSheetFormate
}

