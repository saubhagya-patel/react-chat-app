import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "../../addUser/AddUser";
import { useUserStore } from "../../../library/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../library/firebase";
import { useChatStore } from "../../../library/chatStore";

function ChatList() {
  const [addToggle, setAddToggle] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // setChats(doc.data());
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <>
      <div className="chatList scrollbar">
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="search" />
            <input
              type="text"
              name="search"
              placeholder="Search"
              onChange={(e) => {
                setInput(e.target.value);
              }}
            />
          </div>
          <img
            src={addToggle ? "./minus.png" : "./plus.png"}
            alt="plus"
            className="add"
            onClick={() => setAddToggle((prev) => !prev)}
          />
        </div>

        {filteredChats.map((chat) => (
          <div
            className="item"
            key={chat.chatId}
            onClick={() => {
              handleSelect(chat);
            }}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? "./avatar.png"
                  : chat.user.avatar || "./avatar.png"
              }
              alt="avatar"
            />
            <div className="texts">
              <span>
                {chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : chat.user.username}
              </span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}

        {addToggle && <AddUser />}
      </div>
    </>
  );
}

export default ChatList;
