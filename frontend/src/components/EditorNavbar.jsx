import React from "react";
import logo from "../images/logo.png";
import { FiDownload } from "react-icons/fi";

const EditorNavbar = ({ item, onDownload , isLightMode }) => {

    const changeTheme = () => {
        document.body.classList.toggle("lightMode", !isLightMode);
        setIsLightMode(!isLightMode);
    };

    return (
        <>
            <div className="editorNavbar flex items-center justify-between  px-[100px] h-[80px] bg-[#141414]">
                <div className="logo">
                    <img className="w-[150px] cursor-pointer" src={logo} alt="" />
                </div>
                <p>File / <span className="text-[gray]">{item?.title || "Untitled Project"}</span></p>
                <i
                    className="download p-2 bg-black rounded-lg cursor-pointer text-xl"
                    onClick={onDownload} // Use the passed function here
                >
                    <FiDownload />
                </i>
            </div>
        </>
    );
};

export default EditorNavbar;
