import React from "react";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Notification() {
  return (
    <>
      <div>
        <ToastContainer
          position="top-right"
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          theme="dark"
          transition:Slide
        />
      </div>
    </>
  );
}

export default Notification;
