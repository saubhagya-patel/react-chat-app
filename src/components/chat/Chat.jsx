import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./chat.css";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../library/firebase";
import { useChatStore } from "../../library/chatStore";
import { useUserStore } from "../../library/userStore";
import upload from "../../library/upload";

function Chat() {
  const [emojiPickerDisplay, setEmojiPickerDisplay] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    let newMessage = textMessage;
    newMessage = newMessage + e.emoji;
    setTextMessage(newMessage);
    setEmojiPickerDisplay(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (textMessage === "") return;
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: textMessage,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatData.chats[chatIndex].lastMessage = textMessage;
          userChatData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: null,
    });

    setTextMessage("");
  };

  return (
    <>
      <div className="chat">
        <div className="top">
          <div className="user">
            <img src={user?.avatar || "./avatar.png"} alt="avatar" />
            <div className="texts">
              <span>{user?.username}</span>
              <p>Lorem ipsum dolor sit amet.</p>
            </div>
          </div>

          <div className="icons">
            <img src="./phone.png" alt="phone" />
            <img src="./video.png" alt="video" />
            <img src="./info.png" alt="info" />
          </div>
        </div>

        <div className="center">
          {chat?.messages?.map((message) => (
            <div
              className={
                message.senderId == currentUser.id ? "message own" : "message"
              }
              key={message?.createdAt}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                {/* <span>{message}</span> */}
              </div>
            </div>
          ))}

          {img.url && (
            <div className="message own">
              <div className="texts">
                <img src={img.url} alt="img" />
              </div>
            </div>
          )}

          <div ref={endRef}></div>
        </div>

        <div className="bottom">
          <div className="icons">
            <label htmlFor="file">
              <img src="./img.png" alt="img" />
            </label>
            <input
              type="file"
              id="file"
              style={{
                display: "none",
              }}
              onChange={handleImg}
            />
            <img src="./camera.png" alt="camera" />
            <img src="./mic.png" alt="mic" />
          </div>
          <input
            type="text"
            name="message"
            id="message"
            value={textMessage}
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send a message."
                : "Type a message..."
            }
            onChange={(e) => setTextMessage(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji">
            <img
              src="./emoji.png"
              alt="emoji"
              onClick={() => setEmojiPickerDisplay((prev) => !prev)}
            />
            <div className="picker">
              <EmojiPicker
                open={emojiPickerDisplay}
                onEmojiClick={(e) => handleEmoji(e)}
              />
            </div>
          </div>
          <button
            className="sendButton"
            onClick={() => handleSend()}
            disabled={isReceiverBlocked || isCurrentUserBlocked}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
