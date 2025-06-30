import User_master from "../../models/admin/user.model.js";
import { faker } from "@faker-js/faker";
import { ConnectDB } from "../connectionDB.js";
import bcrypt from "bcryptjs";

// Function to generate random hobbies
function generateHobbies() {
    const hobbies = [
      'reading', 'traveling', 'cycling', 'painting', 'gardening', 
      'hiking', 'surfing', 'photography', 'gaming', 'writing',
      'football', 'cricket', 'hockey','vollyball', 'chess'
    ];
    const count = faker.number.int({ min: 2, max: 5 });
    return faker.helpers.arrayElements(hobbies, count);
}

function generateCity() {
    const hobbies = [
      'Surat', 'Kim', 'Kosad', 'Amroli', 'Rajkot', 
      'Kutch', 'Vadodar', 'Ahmedabad', 'Porbandar', 'Jamnagar',
      'Bhavnagar', 'Navsari', 'Bharuch','Anand', 'Morbi'
    ];
    const count = faker.number.int({ min: 2, max: 5 });
    return faker.helpers.arrayElements(hobbies, count);
}

function GenerateUser() {
    return{
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        userName: faker.person.firstName(),
        email: faker.internet.email(),
        // country: faker.location.country(),
        country: faker.number.int({ min: 2, max: 5 }),
        // state: faker.location.state(),
        state: faker.number.int({ min: 2, max: 5 }),
        city: faker.location.city(),
        password: bcrypt.hashSync('Navin@123', 10),
        mobCode: `+${faker.location.countryCode('numeric')}`,
        mobile: faker.phone.number({ style: 'international' }),
        wallet_amt : 1000,
        roleid : '68464228735ea0f90a85f7c1',
        isapproved: true,
        isverified: true,
        status : 'Active',
        isDeleted : false
    }
}


// Generate 1000 users
export const generateUsers = (count) => {
    const users = [];    
    for (let i = 0; i < count; i++) {
      users.push(GenerateUser());
    }
    return users;
};

export default async function userSeed()
{
    ConnectDB();
    const users = generateUsers(5);    
    const result = await User_master.insertMany(users);
    // console.log("Documents inserted:", result);
}

// Execute seeder
userSeed().then(() => {
  console.log("User Seeding completed");
  process.exit(0);
}).catch((err) => {
  console.error("User Seeding Error:", err);
  process.exit(1);
});

//node database/seeders/userSeeder.js