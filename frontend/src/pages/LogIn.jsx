import React, { useState } from "react";
import logo from "../images/logo.png"
import { Link, useNavigate } from 'react-router-dom';
import image from "../images/authPageSide.png"
import { api_base_url } from "../helper";

const LogIn = () => {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");

    const navigate= useNavigate();
    const [error, setError] = useState("");

    const submitForm = (e) => {
        e.preventDefault();
        fetch(api_base_url + "/logIn", {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: pwd
            })
        }).then((res) => res.json()).then((data) => {
            if (data.success === true) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem("userId", data.userId);
                setTimeout(() => {
                    window.location.href = "/"
                },200);
            }
            else {
                setError(data.message);
            }
        })
    }

    return (
        <>
            <div className="conatiner w-screen min-h-screen flex items-center justify-between pl-[100px]">
                <div className="left w-[40%]">
                    <img className="w-[200px]" src={logo} alt="" />
                    <form onSubmit={submitForm} className="w-full mt-[50px]">

                        <div className="inputBox">
                            <input required onChange={(e) => { setEmail(e.target.value) }} value={email} type="email" placeholder="Email" />
                        </div>

                        <div className="inputBox">
                            <input required onChange={(e) => { setPwd(e.target.value) }} value={pwd} type="password" placeholder="Password" />
                        </div>

                        <p className="text-[gray]">Don't have an account? <Link to="/SignUp" className="text-[#00AEEF]">SignUp</Link></p>

                        <p className="text-red-500 text-sm my-2">{error}</p>
                        
                        <button className="btnBlue w-full mt-[20px]">Log In</button>
                    </form>
                </div>

                <div className="right w-[55%]">
                    <img className="h-[100vh] w-[100%] object-cover" src={image} alt="" />
                </div>
            </div>
        </>
    )
}

export default LogIn