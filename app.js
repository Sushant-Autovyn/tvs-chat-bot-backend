require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./src/db/mongoose');
const chatRoute = require('./src/routes/chatRoute');
const userRoute = require('./src/routes/userRoute');
const supportChatRoute = require('./src/routes/supportChatRoute');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/chat', chatRoute);
app.use('/api/users', userRoute);
app.use('/api/support', supportChatRoute);

app.get('/', (req, res) => {
  res.json({ message: 'TVS Dealer Chatbot Backend Running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});