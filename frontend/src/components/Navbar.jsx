import React, { useEffect, useState, useRef } from "react";
import logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import { MdOutlineLightMode } from "react-icons/md";
import { BsGridFill } from "react-icons/bs";
import { api_base_url } from "../helper";

const Navbar = ({ isGridLayout, setIsGridLayout, isLightMode, setIsLightMode }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const changeTheme = () => {
    document.body.classList.toggle("lightMode", !isLightMode);
    setIsLightMode(!isLightMode);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetch(api_base_url + "/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setData(data.user);
        } else {
          setError(data.message);
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (isDropdownVisible) {
      window.addEventListener("click", handleClickOutside);
    } else {
      window.removeEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownVisible]);

  return (
    <>
      <div className="navbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
          <img className="w-[150px] cursor-pointer" src={logo} alt="Logo" />
        </div>
        <div className="links flex items-center gap-6">
          {/* Links to scroll to specific sections */}
          <a href="#home" className="hover:text-[#00AEEF]">
            Home
          </a>
          <a href="#about" className="hover:text-[#00AEEF]">
            About
          </a>
          <a href="#contact" className="hover:text-[#00AEEF]">
            Contact
          </a>
          <a href="#services" className="hover:text-[#00AEEF]">
            Services
          </a>

          {/* Log Out Button */}
          <button onClick={logout} className="btnBlue !bg-red-700 min-w-[120px] hover:!bg-[#00AEEF]">
            Log Out
          </button>

          {/* User Avatar */}
          <Avatar
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering window click event
              toggleDropdown();
            }}
            className="cursor-pointer ml-2"
            name={data ? data.name : ""}
            size="40"
            round="50%"
          />
        </div>

        {/* Profile Dropdown */}
        {isDropdownVisible && (
          <div
            ref={dropdownRef}
            className="dropDownNavbar absolute right-24 top-16 p-3 shadow-lg shadow-black/50 bg-[#1A1919] w-48 h-44 rounded-md"
          >
            <div className="linebreak py-3 border-b-[1px] border-b-white flex justify-center">
              <h3 className="text-2xl" style={{ lineHeight: 1 }}>
                {data ? data.name : " "}
              </h3>
            </div>
            {/* Theme Toggle */}
            <i
              onClick={changeTheme}
              className="flex items-center justify-center gap-2 mt-4 mb-3 cursor-pointer"
              style={{ fontStyle: "normal" }}
            >
              <MdOutlineLightMode className="text-2xl" /> Light Mode
            </i>
            {/* Grid Layout Toggle */}
            <i
              onClick={() => setIsGridLayout(!isGridLayout)}
              className="flex items-center justify-center gap-2 mt-3 mb-2 cursor-pointer"
              style={{ fontStyle: "normal" }}
            >
              <BsGridFill className="text-2xl" /> Grid Layout
            </i>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
