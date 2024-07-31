const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');  

const app = express();
const port = 3000;


app.use(cors());  
app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/flightstatus', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));


const accountSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confirmPassword: String
});
const Account = mongoose.model('Account', accountSchema);


const updateSchema = new mongoose.Schema({
    mobile: String,
    email: String
});
const Update = mongoose.model('Update', updateSchema);



const flightSchema = new mongoose.Schema({
    flight_id: String,
    airline: String,
    status: String,
    departure_gate: String,
    arrival_gate: String,
    scheduled_departure: Date,
    scheduled_arrival: Date,
    actual_departure: Date,
    actual_arrival: Date
});
const Flight = mongoose.model('Flight', flightSchema);


app.post('/create-account', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    const account = new Account({ name, email, password, confirmPassword });
    try {
        await account.save();
        res.status(201).send('Account created successfully');
    } catch (error) {
        res.status(500).send('Error creating account');
    }
});


app.get('/login', async (req, res) => {
    const { email, password } = req.query;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(401).send('Email not found');
        }
        if (account.password !== password) {
            return res.status(401).send('Incorrect password');
        }

        res.status(200).send('Logged in successfully');
    } catch (error) {
        res.status(500).send('Error checking login details');
    }
});


app.get('/flight', async (req, res) => {
    const { flightId } = req.query;

    if (!flightId) {
        return res.status(400).send('Flight ID is required');
    }

    try {
        const flight = await Flight.findOne({ flight_id: flightId });
        if (!flight) {
            return res.status(404).send('Flight not found');
        }

        res.status(200).json(flight);
    } catch (error) {
        res.status(500).send('Error fetching flight details');
    }
});


app.post('/register-updates', async (req, res) => {
    const { mobile, email } = req.body;

    if (!mobile || !email) {
        return res.status(400).send('Mobile number and email are required');
    }

    const update = new Update({ mobile, email });
    try {
        await update.save();
        res.status(201).send('Registration successful');
    } catch (error) {
        res.status(500).send('Error registering updates');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
