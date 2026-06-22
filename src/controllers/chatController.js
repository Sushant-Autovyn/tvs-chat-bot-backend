const intents = require('../data/questionData.json');

function getReply(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  for (const intent of intents) {
    const matched = intent.keywords.some(keyword =>
      msg.includes(keyword.toLowerCase())
    );
    if (matched) return intent;
  }

  return intents.find(i => i.intent === 'fallback');
}

module.exports = { getReply };