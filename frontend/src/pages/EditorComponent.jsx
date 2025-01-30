import React, { useEffect, useState } from "react";
import JSZip from "jszip"; // Import JSZip
import EditorNavbar from "../components/EditorNavbar";
import Editor from "@monaco-editor/react";
import { MdLightMode } from "react-icons/md";
import { RiExpandDiagonalSLine } from "react-icons/ri";
import { api_base_url } from "../helper";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const EditorComponent = () => {
    const { projectID } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [item, setItem] = useState(location.state?.item || null);
    const [htmlCode, setHtmlCode] = useState("<h1>Hello World</h1>");
    const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
    const [jsCode, setJsCode] = useState("// some comment");
    const [isLightMode, setIsLightMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [tab, setTab] = useState("html");

    const changeTheme = () => {
        document.body.classList.toggle("lightMode", !isLightMode);
        setIsLightMode(!isLightMode);
    };

    // Fetch project details if item is not available in state
    useEffect(() => {
        if (!item) {
            fetch(`${api_base_url}/getProject`, {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    projId: projectID,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setItem(data.project);
                        setHtmlCode(data.project.htmlCode);
                        setCssCode(data.project.cssCode);
                        setJsCode(data.project.jsCode);
                    } else {
                        alert("Failed to fetch project data!");
                        navigate("/");
                    }
                })
                .catch((err) => {
                    console.error("Error fetching project data:", err);
                    alert("Error loading project. Redirecting to home.");
                    navigate("/");
                });
        }
    }, [item, projectID, navigate]);

    const run = () => {
        const html = htmlCode;
        const css = `<style>${cssCode}</style>`;
        const js = `<script>${jsCode}</script>`;
        const iframe = document.getElementById("iframe");
        if (iframe) iframe.srcdoc = html + css + js;
    };

    useEffect(() => {
        const timeout = setTimeout(run, 200);
        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    // Handle download functionality
    const handleDownload = () => {
        const zip = new JSZip(); // Create a new zip instance
        const folderName = item?.title || "Untitled Project"; // Folder name for the zip file

        // Add HTML, CSS, and JavaScript files to the zip
        zip.file("index.html", htmlCode);
        zip.file("styles.css", cssCode);
        zip.file("script.js", jsCode);

        // Generate the zip file and trigger download
        zip.generateAsync({ type: "blob" }).then((content) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `${folderName}.zip`; // Download the zip with the project name
            link.click();
        });
    };

    if (!item) {
        return <p>Loading...</p>; // Show a loading spinner or message while fetching data
    }

    return (
        <>
            <EditorNavbar item={item} onDownload={handleDownload} isLightMode={isLightMode} />
            <div className="flex">
                <div className={`left ${isExpanded ? "w-full" : "w-1/2"}`}>
                    <div className="tabNav flex items-center justify-between gap-4 w-full bg-[#1A1919] h-10 px-10">
                        <div className="flex items-center gap-2">
                            <div onClick={() => setTab("html")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                                HTML
                            </div>
                            <div onClick={() => setTab("css")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                                CSS
                            </div>
                            <div onClick={() => setTab("js")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                                JavaScript
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <i className="text-lg cursor-pointer" onClick={changeTheme}>
                                <MdLightMode />
                            </i>
                            <i className="text-lg cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                                <RiExpandDiagonalSLine />
                            </i>
                        </div>
                    </div>

                    {tab === "html" && (
                        <Editor
                            className="p-[1px]"
                            height="84vh"
                            theme={isLightMode ? "vs-light" : "vs-dark"}
                            language="html"
                            value={htmlCode}
                            onChange={(value) => setHtmlCode(value || "")}
                        />
                    )}
                    {tab === "css" && (
                        <Editor
                            className="p-[1px]"
                            height="84vh"
                            theme={isLightMode ? "vs-light" : "vs-dark"}
                            language="css"
                            value={cssCode}
                            onChange={(value) => setCssCode(value || "")}
                        />
                    )}
                    {tab === "js" && (
                        <Editor
                            className="p-[1px]"
                            height="84vh"
                            theme={isLightMode ? "vs-light" : "vs-dark"}
                            language="javascript"
                            value={jsCode}
                            onChange={(value) => setJsCode(value || "")}
                        />
                    )}
                </div>
                {!isExpanded && (
                    <iframe id="iframe" className="w-1/2 min-h-[50vh] bg-white text-black" title="output" />
                )}
            </div>
        </>
    );
};

export default EditorComponent;
