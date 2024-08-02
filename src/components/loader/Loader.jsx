import React from "react";
import { Bars } from "react-loading-icons";
import "./loader.css";

function BoxLoader() {
  return (
    <>
      {/* <div className="loading"> */}
      <Bars height={"80px"} fill="#0271a9" />
      {/* </div> */}
    </>
  );
}

export default BoxLoader;
