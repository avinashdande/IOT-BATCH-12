require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('AppLogin', userSchema);

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword, // Fix: Ensure 'password' field is used
    });
    

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// ThingSpeak Data Fetching
const channelId = "2836452";
const readAPIKey = "X0U8SSJNNHO69OJS";
const resultsCount = 4;

// const fetchThingSpeakData = async () => {
//   const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readAPIKey}&results=${resultsCount}`;

//   try {
//     const response = await axios.get(url);

//     if (!response.data || !response.data.feeds) {
//       throw new Error("Invalid response from ThingSpeak API");
//     }

//     return response.data.feeds.map(({ created_at, field1, field2 }) => ({
//       timestamp: created_at,
//       alcoholLevel: parseFloat(field1).toFixed(2),
//       temperature: field2,
//     }));
//   } catch (error) {
//     console.error("❌ Error fetching data from ThingSpeak:", error.message);
//     throw new Error("Failed to fetch data from ThingSpeak");
//   }
// };
function sendMessage(){
  const twilio = require('twilio');
  
  // Replace with your Twilio Account SID and Auth Token
  const accountSid = 'AC76012aa96a48dbc86772e2959b7dad81'; // Get from your Twilio Console
  const authToken = '413d3e66fab7ca11ad26809a361c0c2d';  // Get from your Twilio Console
  
  // Create a Twilio client
  const client = new twilio(accountSid, authToken);
  
  // Send a message
  client.messages
    .create({
      body: 'Your Car Driver is Consumed Alcohol', // Message content
      from: '+16413213094', // Your Twilio phone number
      to: '+919346610887',   // The recipient's phone number
    })
    .then((message) => console.log('Message sent! SID:', message.sid))
    .catch((error) => console.error('Error sending message:', error));
  
      }
const fetchThingSpeakData = async () => {
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readAPIKey}&results=${resultsCount}`;

  try {
    const response = await axios.get(url);

    if (!response.data || !response.data.feeds || response.data.feeds.length === 0) {
      throw new Error("Invalid response from ThingSpeak API or no feeds available.");
    }

    // Sort feeds by the 'created_at' timestamp to get the most recent entry
    const sortedFeeds = response.data.feeds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Get the most recent alcohol value
    const mostRecentFeed = sortedFeeds[0];

    // Print the recently updated alcohol value
    const recentAlcoholLevel = parseFloat(mostRecentFeed.field1).toFixed(2);
    if(recentAlcoholLevel > 1.1){
      sendMessage();
  }

    // Optionally, return the processed data if needed
    return sortedFeeds.map(({ created_at, field1, field2 }) => ({
      timestamp: created_at,
      alcoholLevel: parseFloat(field1).toFixed(2),
      temperature: field2,
    }));

  } catch (error) {
    console.error("❌ Error fetching data from ThingSpeak:", error.message);
    throw new Error("Failed to fetch data from ThingSpeak");
  }
};

app.get("/api/getThingSpeakData", async (req, res) => {
  try {
    const data = await fetchThingSpeakData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
