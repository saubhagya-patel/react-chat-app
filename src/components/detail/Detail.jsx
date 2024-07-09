import React from "react";
import "./detail.css";
import { auth, db } from "../../library/firebase";
import { useChatStore } from "../../library/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../library/userStore";

function Detail() {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="detail">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="avatar" />
          <h2>{user?.username}</h2>
          <p>Lorem ipsum dolor sit amet.</p>
        </div>

        <div className="info">
          <div className="option">
            <div className="title">
              <span>Chat Settings</span>
              <img src="./arrowUp.png" alt="up" />
            </div>
          </div>

          <div className="option">
            <div className="title">
              <span>Privacy & Help</span>
              <img src="./arrowUp.png" alt="up" />
            </div>
          </div>

          <div className="option">
            <div className="title">
              <span>Shared Photos</span>
              <img src="./arrowDown.png" alt="down" />
            </div>

            <div className="photos">
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="https://picsum.photos/300" alt="" />
                  <span>photo_2024</span>
                </div>
                <img src="./download.png" alt="download" className="icon" />
              </div>
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="https://picsum.photos/300" alt="" />
                  <span>photo_2024</span>
                </div>
                <img src="./download.png" alt="download" className="icon" />
              </div>
            </div>
          </div>

          <div className="option">
            <div className="title">
              <span>Shared Files</span>
              <img src="./arrowUp.png" alt="up" />
            </div>
          </div>

          <button onClick={() => handleBlock()}>
            {isCurrentUserBlocked
              ? "You are blocked."
              : isReceiverBlocked
              ? "User Blocked."
              : "Block User"}
          </button>
          <button className="logout" onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Detail;
