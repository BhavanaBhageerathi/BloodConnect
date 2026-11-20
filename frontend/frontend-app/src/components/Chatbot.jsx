import { useState } from "react";
import PublicAPI from "../services/api";

function Chatbot() {

    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "ASSISTANT",
            content: "Hello! 👋 Welcome to BloodConnect. How can I help you today?"
        }
    ]);

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [conversationId, setConversationId] = useState(null);


    // Send Message
    const sendMessage = async () => {

        if (message.trim() === "" || loading) {
            return;
        }

        const userMessage = message.trim();

        // Display user message immediately
        setMessages(prevMessages => [
            ...prevMessages,
            {
                role: "USER",
                content: userMessage
            }
        ]);

        setMessage("");

        setLoading(true);

        try {

            const response = await PublicAPI.post(
                "/chatbot/chat/",
                {
                    message: userMessage,
                    conversation_id: conversationId
                }
            );

            // Save conversation ID
            if (!conversationId) {
                setConversationId(response.data.conversation_id);
            }

            // Display AI response
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: "ASSISTANT",
                    content: response.data.ai_response
                }
            ]);

        }

        catch (error) {

            console.error("Chatbot error:", error);

            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: "ASSISTANT",
                    content: "Sorry, I am unable to respond right now. Please try again later."
                }
            ]);

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <>

            {/* Floating Chatbot Button */}

            {!isOpen && (

                <button
                    className="btn btn-danger rounded-circle shadow"
                    style={{
                        position: "fixed",
                        bottom: "25px",
                        right: "25px",
                        width: "100px",
                        height: "100px",
                        zIndex: 1000
                    }}
                    onClick={() => setIsOpen(true)}
                >

                    <i className="bi bi-chat-dots-fill fs-3"></i>

                </button>

            )}


            {/* Chat Window */}

            {isOpen && (

                <div
                    className="card shadow"
                    style={{
                        position: "fixed",
                        bottom: "25px",
                        right: "25px",
                        width: "350px",
                        height: "500px",
                        zIndex: 1000,
                        borderRadius: "15px",
                        overflow: "hidden"
                    }}
                >

                    {/* Header */}

                    <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">

                        <div>

                            <h6 className="mb-0">

                                <i className="bi bi-robot me-2"></i>

                                BloodConnect AI

                            </h6>

                            <small>Ask us anything</small>

                        </div>


                        <button
                            className="btn btn-sm text-white"
                            onClick={() => setIsOpen(false)}
                        >

                            <i className="bi bi-x-lg"></i>

                        </button>

                    </div>


                    {/* Chat Messages */}

                    <div
                        className="card-body"
                        style={{
                            overflowY: "auto",
                            backgroundColor: "#f8f9fa"
                        }}
                    >

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`d-flex mb-3 ${
                                    msg.role === "USER"
                                        ? "justify-content-end"
                                        : "justify-content-start"
                                }`}
                            >

                                <div
                                    className={`p-3 rounded ${
                                        msg.role === "USER"
                                            ? "bg-danger text-white"
                                            : "bg-white border"
                                    }`}
                                    style={{
                                        maxWidth: "80%",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >

                                    {msg.content}

                                </div>

                            </div>

                        ))}


                        {/* Thinking Indicator */}

                        {loading && (

                            <div className="d-flex justify-content-start mb-3">

                                <div className="bg-white border p-3 rounded">

                                    <span className="text-muted me-2">
                                        Thinking
                                    </span>

                                    <span className="spinner-grow spinner-grow-sm text-danger"></span>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* Message Input */}

                    <div className="card-footer bg-white">

                        <div className="input-group">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                                disabled={loading}
                            />

                            <button
                                className="btn btn-danger"
                                onClick={sendMessage}
                                disabled={loading || message.trim() === ""}
                            >

                                {loading ? (

                                    <span className="spinner-border spinner-border-sm"></span>

                                ) : (

                                    <i className="bi bi-send-fill"></i>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}

export default Chatbot;