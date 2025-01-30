import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css"
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import EditorComponent from "./pages/EditorComponent";

const App = () => {
  let isLoggedIn = localStorage.getItem("isLoggedIn");
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={isLoggedIn ? <Home /> : <Navigate to ="/logIn"/>} />
            <Route path="*" element={isLoggedIn?<NoPage />: <Navigate to ="/logIn"/>} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/logIn" element={<LogIn />} />
            <Route path="/editor/:projectID" element={ isLoggedIn?<EditorComponent/>: <Navigate to ="/logIn"/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App