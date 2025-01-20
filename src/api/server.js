import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 5000;

// Botpress Chat API Config
const CHAT_API_URL = 'https://chat.botpress.cloud/402fb9c8-6064-4eb0-a93a-961eec83a2b7';
const USER_ID = 'ptdat21011';
let humanUserId = null;

let detectedBotUserId = null; // Store bot user ID dynamically
const activeConversations = {}; // Store active conversation IDs per user
let xUserKey = null; // Cache the x-user-key for reuse

app.use(express.json());
app.use(cors());

app.post('/api/message', async (req, res) => {
  const { text } = req.body;

  try {
    console.log('Received user message:', text);

    // Step 1: Ensure User Exists
    if (!xUserKey) {
      console.log('Step 1: Creating user...');
      const userResponse = await axios.post(
        `${CHAT_API_URL}/users`,
        { userId: USER_ID },
        { headers: { 'Content-Type': 'application/json' } }
      );
      xUserKey = userResponse.data.key;
      console.log('User key retrieved:', xUserKey);
    }

    // Step 2: Check or Create Conversation
    let conversationId = activeConversations[USER_ID];
    if (!conversationId) {
      console.log('Step 2: Creating new conversation...');
      const conversationResponse = await axios.post(
        `${CHAT_API_URL}/conversations`,
        { userId: USER_ID },
        { headers: { 'Content-Type': 'application/json', 'x-user-key': xUserKey } }
      );
      conversationId = conversationResponse.data.conversation.id;
      activeConversations[USER_ID] = conversationId;
      console.log('New conversation created:', conversationId);
    } else {
      console.log('Reusing existing conversation:', conversationId);
    }

    // Step 3: Send Message to Botpress
    console.log('Step 3: Sending message to Botpress:', { conversationId, text });
    const messagesToBotpressRes = await axios.post(
      `${CHAT_API_URL}/messages`,
      {  payload: { type: 'text', text: text.trim() }, conversationId: conversationId },
      { headers: { 'Content-Type': 'application/json', 'x-user-key': xUserKey } }
    );

    // Step 4: Retrieve Messages from Botpress
    console.log('Step 4: Retrieving messages from Botpress...');
    let messagesResponse;
    let lastMessageUserId = null;
    let humanUserId = null;
    while (lastMessageUserId == humanUserId) {
      messagesResponse = await axios.get(
        `${CHAT_API_URL}/conversations/${conversationId}/messages`,
        { headers: { 'Content-Type': 'application/json', 'x-user-key': xUserKey } }
      );
      let messagesLength = messagesResponse.data.messages.length;
      humanUserId = messagesResponse.data.messages[messagesLength - 1].userId;
      lastMessageUserId = messagesResponse.data.messages[0].userId;
    }
    console.log('Full List of Messages:', JSON.stringify(messagesResponse.data, null, 2));
    const messages = messagesResponse.data.messages;
    const lastBotMessage = messages[0].payload.text ?? 'co loi xay ra';
    
    // Dynamically detect bot user ID if not already detected
    // if (!detectedBotUserId) {
    //   detectedBotUserId = messages[0].userId || null;
    //   console.log('Dynamically Detected Bot User ID:', detectedBotUserId);
    // }

    // if (detectedBotUserId) {
    //   // Filter messages from the bot
    //   const botMessages = messages.filter((msg) => msg.userId === detectedBotUserId);
    //   const lastBotMessage = botMessages.find((msg) => msg.payload?.type === 'text')?.payload?.text;

    //   if (lastBotMessage) {
    //     console.log('Final Extracted Bot Response:', lastBotMessage);
    //     res.json({ text: lastBotMessage });
    //   } else {
    //     console.log('No valid bot response found in conversation history.');
    //     res.json({ text: 'No valid bot response found. Please check your bot configuration.' });
    //   }
    // } else {
    //   console.log('Failed to detect bot user ID.');
    //   res.json({ text: 'Failed to detect bot response. Please check your bot configuration.' });
    // }
    // console.log('Final Extracted Bot Response:', lastBotMessage);
    res.json({ text: lastBotMessage });
  } catch (error) {
    console.error('Error occurred:', error.message);
    if (error.response) console.error('Error Response Data:', error.response.data);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
