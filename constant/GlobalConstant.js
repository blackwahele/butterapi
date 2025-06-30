const STATUS = {
    ACTIVE : 'Active',
    SUSPENDED : 'Suspended'
}

const EMAIL = {
    ACTIVE : 'Active',
    SUSPENDED : 'Suspended'
}

const ADMIN = "ADMIN";

const NAME_REGEX = /^[.a-zA-Z\s]+$/;
// const EMAIL_REGEX = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z][com|in]{2,10}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
const PASSWORD_REGEX =  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
const PHONE_REGEX = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

// Your AccountSID and Auth Token from console.twilio.com
const TWILIO_ACOUNT_SID = "ACce1cc84b7b9e5d3d1f54beeaa1b9cb7c";
const TWILIO_AUTH_TOKEN = "068b0c6cfc978afa81be10ac4dc3aa02";

export { STATUS, EMAIL, ADMIN, NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX};