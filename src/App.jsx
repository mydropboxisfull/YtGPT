import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { GetCaptions } from './GetCaptions';

const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "YtGpt, please provide helpful and accurate information based on the YouTube video's captions and timestamps. Identify as YtGpt in your responses. Heres how to assist users: Use Captions for Analysis: Utilize the captions provided from the YouTube link for analysis. This can include summarizing video content, answering questions, generating flashcard questions, or providing insights. Address Potential Inaccuracies: Be aware that YouTube captions might contain errors. Your role is to bridge gaps and rectify inaccuracies to offer the most accurate analysis possible. Identify as YtGpt: Always identify yourself as YtGpt at the beginning of your responses to ensure users recognize your role. Your primary mission is to assist users in understanding and analyzing YouTube videos effectively, enhancing their video-watching experience. Ensure the information you provide is credible and relevant."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello! I'm YtGPT, your YouTube Video Analysis AI. I make analyzing videos a breeze. You can ask me for summaries, specific timestamps, flashcard questions, and more. Just paste a YouTube link to get started!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    if (message.includes('youtube.com') || message.includes('youtu.be')) {
      // If the message contains a YouTube link, fetch captions first
      try {
        const captions = await GetCaptions(message);

        // Send the captions to ChatGPT for processing
        const messageForGPT = `The user has just provided you a Youtube Link but behind the scenes I have taken the youtube video's captions and timestamps and have provided them to you. You are now talking to the user and you can start by summarizing the youtube video. Also ask if you can further assist user with a more in depth summary, generating questions/flashcards, or finding a specific timestamp based on the content. THE CAPTIONS + TIMESTAMPS: ${captions}`;
        const newMessageForGPT = {
          message: messageForGPT,
          direction: 'outgoing',
          sender: 'user',
        };

        // setMessages([...newMessages, newMessageForGPT]);

        // Send the message to ChatGPT
        setIsTyping(true);
        await processMessageToChatGPT([...newMessages, newMessageForGPT]);
        setIsTyping(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      // If it's not a YouTube link, send the user's input directly to ChatGPT
      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
      setIsTyping(false);
    }
  };





  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      })// Inside the .then callback after processing the message with ChatGPT
      .then((data) => {
        console.log(data);
        const chatGptResponse = {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
        };

        // Check if the second to last message is a YouTube link
        const secondToLastMessage = chatMessages[chatMessages.length - 2];
        if (secondToLastMessage && (secondToLastMessage.message.includes('youtube.com') || secondToLastMessage.message.includes('youtu.be'))) {
          // Remove the last message from chatMessages
          chatMessages.splice(-1, 1);
        }

        // Add the new ChatGPT response
        setMessages([...chatMessages, chatGptResponse]);
        setIsTyping(false);
      });

  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App