
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
  });
  
const openai = new OpenAIApi(configuration);

async function executeChatCompletion() {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello world" },
      ],
    });
    // console.log(completion[0].message.content);
    console.log(completion.data.choices[0].message);
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
  }
}

executeChatCompletion();
