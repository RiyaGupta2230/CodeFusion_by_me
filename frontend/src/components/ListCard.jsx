import React, { useState } from "react";
import img from "../images/code.png"
import deleteImg from "../images/delete.png"
import { api_base_url } from "../helper";
import { useNavigate } from "react-router-dom";

const ListCard = ({item, isLightMode }) => {
    const navigate = useNavigate();
    const [isDeleteModelShow, setisDeleteModelShow] = useState(false);
    
    const changeTheme = () => {
        document.body.classList.toggle("lightMode", !isLightMode);
    };
    
    const deleteProj = (id) => {
        fetch(api_base_url + "/deleteProject", {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                progId: id,
                userId: localStorage.getItem("userId")
            })
        }).then( res => res.json()).then(data => {
            if(data.success){
                setisDeleteModelShow(false)
                window.location.reload()
            }
            else{
                alert(data.message)
                setisDeleteModelShow(false)
            }
        })
    }

    return (
        <div>
            <div className="listCard mb-2 w-[full] flex items-center justify-between p-1 bg-[#141414] cursor-pointer rounded-md hover:bg-[#202020]">
                <div onClick={()=> { navigate(`/editor/${item._id}`)}} className="flex items-center gap-2">
                    <img className="w-20" src={img} alt="" />
                    <div>
                        <h3 className="text-xl">{item.title}</h3>
                        <p className=" text-[gray] text-sm">Created on {new Date(item.date).toDateString()}</p>
                    </div>
                </div>
                <div>
                    <img onClick={() => {setisDeleteModelShow(true)}} className="w-9 cursor-pointer mr-4" src={deleteImg} alt="" />
                </div>
            </div>

            {
                isDeleteModelShow ?
                    <div className="model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex items-center justify-center flex-col">
                        <div className="mainModel w-[28vw] h-[30vh] bg-[#141414] rounded-lg p-6">
                            <h3 className="text-3xl text-center m-2 mb-5">Do you want to delete this project?</h3>
                            <div className="flex w-full mt-10 items-center gap-4 justify-center text-lg">
                                <button onClick={()=> {deleteProj(item._id)}} className="p-3 rounded-lg bg-[#FF4343] text-white cursor-pointer min-w-[45%]">Delete</button>
                                <button onClick={() => {setisDeleteModelShow(false)}}  className="cancel p-3 rounded-lg bg-[#1A1919] text-white cursor-pointer min-w-[45%]">Cancel</button>
                            </div>
                        </div>
                    </div> : ""
            }
        </div>
    )
}

export default ListCard