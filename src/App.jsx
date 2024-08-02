import React, { useEffect } from "react";
import { Loader, Chat, Detail, List, Login, Notification } from "./components";
import "./index.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./library/firebase";
import { useUserStore } from "./library/userStore";
import { useChatStore } from "./library/chatStore";

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <Loader />;

  return (
    <>
      {/* <div className="container h-screen w-screen"> */}
      <div className="main">
        {currentUser ? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Detail />}
          </>
        ) : (
          <Login />
        )}
        <Notification />
      </div>
    </>
  );
}

export default App;
