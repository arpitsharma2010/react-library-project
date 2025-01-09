import React from "react";
import "./App.css";
import { Navbar } from "./Layouts/NavbarAndFooter/Navbar";
import { Footer } from "./Layouts/NavbarAndFooter/Footer";
import { HomePage } from "./Layouts/Homepage/HomePage";
import { SearchBooksPage } from "./Layouts/SearchBooksPage/SearchBooksPage";

export const App = () => {
  return (
    <>
      <Navbar />
      {/* <HomePage/> */}
      <SearchBooksPage />
      <Footer/>
    </>
  );
}
