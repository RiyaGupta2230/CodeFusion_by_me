import React, { useState } from "react";
import codeImg from "../images/code.png"
import deleteImg from "../images/delete.png"
import { useNavigate } from "react-router-dom";

const GridCard = ({ item, isLightMode }) => {
    const navigate = useNavigate();
    const [isDeleteModelShow, setisDeleteModelShow] = useState(false);

    const changeTheme = () => {
        document.body.classList.toggle("lightMode", !isLightMode);
    };

    return (
        <div>
            <div className="gridCard bg-[#141414] w-52 p-2 h-36 hover:bg-[#202020] rounded-md " >
                <div onClick={() => { navigate(`/editor/${item._id}`, { state: { item } }) }} className="">
                    <img className="w-20" src={codeImg} alt="" />
                </div>

                <div className="flex items-center justify-between">
                    <div className="m-1">
                        <h3 className="text-lg w-[100%] line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-[gray]">Created on {new Date(item.date).toDateString()}</p>
                    </div>
                    <img onClick={() => { setisDeleteModelShow(true) }} className="w-8 cursor-pointer" src={deleteImg} alt="delete" />
                </div>
            </div>

            {
                isDeleteModelShow ?
                    <div className="model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex items-center justify-center flex-col">
                        <div className="mainModel w-[28vw] h-[30vh] bg-[#141414] rounded-lg p-6">
                            <h3 className="text-3xl text-center m-2 mb-5">Do you want to delete this project?</h3>
                            <div className="flex w-full mt-10 items-center gap-4 justify-center text-lg">
                                <button className="p-3 rounded-lg bg-[#FF4343]  text-white cursor-pointer min-w-[45%]">Delete</button>
                                <button onClick={() => { setisDeleteModelShow(false) }} className="cancel p-3 rounded-lg bg-[#1A1919] text-white cursor-pointer min-w-[45%]">Cancel</button>
                            </div>
                        </div>
                    </div> : ""
            }
        </div>
    )
}

export default GridCard