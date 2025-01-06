import React from "react";
import "./App.css";
import { Navbar } from "./Layouts/NavbarAndFooter/Navbar";
import { Footer } from "./Layouts/NavbarAndFooter/Footer";
import { HomePage } from "./Layouts/Homepage/HomePage";

export const App = () => {
  return (
    <>
      <Navbar />
      <HomePage/>
      <Footer/>
    </>
  );
}
