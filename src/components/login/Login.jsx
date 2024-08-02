import React, { useState } from "react";
import "./login.css";
import { Slide, toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../library/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import upload from "../../library/upload";

function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      toast.error(err.message, {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password) {
      return toast.warn("Please enter inputs!", {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    }
    if (!avatar.file) {
      return toast.warn("Please upload an avatar!", {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    }

    const userRef = collection(db, "users");
    const q = query(userRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Select another username", {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const imageUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", result.user.uid), {
        username: username,
        email: email,
        avatar: imageUrl,
        id: result.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", result.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!", {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message, {
        theme: "dark",
        closeOnClick: true,
        pauseOnHover: true,
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login">
        <div className="item">
          <h2 className="text-2xl">Log In</h2>
          <form onSubmit={(e) => handleLogin(e)}>
            <input type="email" placeholder="Email" name="email" />

            <input type="password" placeholder="Password" name="password" />
            <button type="submit" disabled={loading}>
              {loading ? "Loading" : "Sign In"}
            </button>
          </form>
        </div>

        <div className="seperator"></div>

        <div className="item">
          <h2 className="text-2xl">Sign Up</h2>
          <form onSubmit={(e) => handleSignup(e)}>
            <label htmlFor="file">
              <img src={avatar.url || "./avatar.png"} alt="" /> Upload an image
            </label>
            <input
              type="file"
              name="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => handleAvatar(e)}
            />
            <input type="text" placeholder="Username" name="username" />
            <input type="email" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button type="submit" disabled={loading}>
              {loading ? "Loading" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
