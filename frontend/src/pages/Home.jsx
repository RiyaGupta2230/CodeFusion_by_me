import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"
import ListCard from "../components/ListCard";
import GridCard from "../components/GridCard";
import { api_base_url } from "../helper";
import { useNavigate } from "react-router-dom";


const Home = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [projTitle, setProjTitle] = useState("");
    const navigate = useNavigate();
    const [isCreateModelShow, setisCreateModelShow] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);


    const filteredData = data ? data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];



    const createProj = (e) => {
        if (projTitle === "") {
            alert("Please enter project title");
        } else {
            fetch(api_base_url + "/createProject", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: projTitle,
                    userId: localStorage.getItem("userId")
                })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    setisCreateModelShow(false)
                    setProjTitle("")
                    alert("Project created successfully");
                    navigate(`/editor/${data.projectId}`);
                }
                else {
                    alert("Something went wrong");
                }
            });
        }
    };

    const getProj = () => {
        fetch(api_base_url + "/getProjects", {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: localStorage.getItem("userId")
            })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setData(data.projects);
            }
            else {
                setError(data.message);
            }
        });
    };

    useEffect(() => {
        getProj();
    }, []);

    const [userData, setUserData] = useState(null);
    const [userError, setUserError] = useState("");

    useEffect(() => {
        fetch(api_base_url + "/getUserDetails", {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: localStorage.getItem("userId")
            })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setUserData(data.user);
            }
            else {
                setUserError(data.message);
            }
        })
    }, []);

    const [isGridLayout, setisGridLayout] = useState(false);

    return (
        <>
            <Navbar isGridLayout={isGridLayout} setIsGridLayout={setisGridLayout} isLightMode={isLightMode}
                setIsLightMode={setIsLightMode} />
            <div className="flex items-center justify-between px-[100px] my-[40px]">
                <h2 className="text-2xl">Hi, {userData ? userData.username : ""}</h2>
                <div className="flex items-center gap-1">
                    <div className="inputBox !w-80">
                        <input className="input" type="text" placeholder="Search Here ..."
                            value={searchQuery} // Bind search input to searchQuery state
                            onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
                        />
                    </div>
                    <button onClick={() => { setisCreateModelShow(true) }} className="btnBlue !rounded-sm mb-4 text-[20px] !p-[9px] !px-[14px] !items-center">+</button>
                </div>
            </div>

            <div className="cards">
                {
                    isGridLayout ?
                        <div className="grid px-[100px]">
                            {
                                filteredData.length > 0 ? filteredData.map((item, index) => (
                                    <GridCard key={index} item={item} isLightMode={isLightMode} />
                                )) : <p>No projects found</p>
                            }
                        </div>
                        : <div className="list px-[100px]">
                            {
                                filteredData.length > 0 ? filteredData.map((item, index) => (
                                    <ListCard key={index} item={item} isLightMode={isLightMode} />
                                )) : <p>No projects found</p>
                            }

                        </div>
                }
            </div>

            {
                isCreateModelShow &&
                <div className="createModelCon fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-[rgb(0,0,0,0.5)] flex items-center justify-center ">
                    <div className="createModel w-[25vw] h-[29vh] bg-[#141414] shadow-md shadow-black/50 rounded-lg p-5 justify-center">
                        <h3 className="text-2xl flex justify-center">Create new project</h3>

                        <div className="inputBox !bg-[#202020] mt-4">
                            <input className="input" onChange={(e) => { setProjTitle(e.target.value) }} value={projTitle} type="text" placeholder="Project Title" />
                        </div>

                        <div className="flex items-center gap-3 w-full mt-8 justify-center">
                            <button onClick={createProj} className="btnBlue !rounded-md mb-4 w-[48%] !p-2 !px-3 ">Create</button>
                            <button onClick={() => { setisCreateModelShow(false) }} className="btnBlue createModelcancel !bg-[#1A1919] !rounded-md mb-4 w-[48%] !p-2 !px-3">Cancel</button>
                        </div>
                    </div>
                </div>
            }

            {/* About Section */}
            <section id="about" className="about bg-[#141414] text-white py-12 mt-44">
                <div className="px-[100px]">
                    <h3 className="text-xl mb-4">About Us</h3>
                    <p>CodeFusion is an innovative online code editor and development platform that enables seamless creation, testing, and collaboration on HTML, CSS, and JavaScript projects. Designed for both beginners and experienced developers, it makes coding accessible and easy without the need for additional software.</p>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact bg-[#202020] text-white py-12">
                <div className="px-[100px]">
                    <h3 className="text-xl mb-4">Contact</h3>
                    <p>Email: <a href="mailto:support@codefusion.com" className="text-blue-400 ">support@codefusion.com</a></p>
                    <p>Phone: <a href="tel:+15551234567" className="text-blue-400 "> +1 (555) 123-4567</a></p>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services bg-[#282828] text-white py-12">
                <div className="px-[100px]">
                    <h3 className="text-xl mb-4">Services</h3>
                    <p>CodeFusion offers various services to help you develop your projects:</p>
                    <ul className="list-disc pl-5">
                        <li>Write and edit HTML, CSS, and JavaScript code directly in your browser.</li>
                        <li>Preview your work in real-time with live updates.</li>
                        <li>Save your projects and files with a simple click.</li>
                        <li>Access your projects anytime and continue coding without losing progress.</li>
                        <li>Supports various text editors with themes for better user experience (light/dark modes).</li>
                        <li>Built-in syntax highlighting for HTML, CSS, and JavaScript for easy coding.</li>
                    </ul>
                </div>
            </section>
        </>
    );
}

export default Home;