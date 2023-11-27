import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim() !== "") {
            onSend(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="flex items-center space-x-2 pb-6 px-5  md:pb-10 md:px-10 xl:pb-[18rem]">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Please enter a valid YouTube link..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown} // Added this line
                    className="rounded-full p-2 pl-8 pr-12 bg-[#2c3453] text-white w-full outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#55bc8c]">
                    <button
                        onClick={handleSend}
                        className=""
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#55bc8c" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
