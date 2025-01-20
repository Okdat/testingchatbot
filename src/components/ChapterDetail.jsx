import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import "./ChapterDetail.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./teacherSidebar";

function ChapterDetail() {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [isEditing, setIsEditing] = useState(false);
  const [newTheoryContent, setNewTheoryContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedOption, setSelectedOption] = useState("youtube");
  const quillRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { chapterId } = useParams();
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  useEffect(() => {
    const fetchChapterDetail = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear previous errors
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const body = JSON.parse(response.data.body);
        if (body && body.data) {
          setChapter(body.data);
          setNewTheoryContent(body.data.theory_content);
          setYoutubeLink(body.data.video_url || "");
          setImageUrl(body.data.image_url || "");
        } else {
          setError(new Error("Chapter data not found")); // Set error if data is missing
        }
      } catch (error) {
        console.error("Failed to fetch chapter detail:", error);
        setError(error); // Set error state
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchChapterDetail();
  }, [chapterId, token]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleSaveTheory = async () => {
    try {
      setIsUploading(true);

      const quillContent = quillRef.current.getEditor().root.innerHTML;
      let videoUrlToSave = chapter.video_url;

      if (selectedOption === "youtube") {
        videoUrlToSave = youtubeLink;
      } else if (selectedOption === "upload" && videoFile) {
        const base64Video = await toBase64(videoFile);
        const videoResponse = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/chapter/${chapterId}/upload-video`,
          {
            file: base64Video,
            fileName: videoFile.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        videoUrlToSave = videoResponse.data.url;
      }

      let imageUrlToSave = imageUrl;
      if (imageFile) {
        const base64Image = await toBase64(imageFile);
        const imageResponse = await axios.put(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/chapter/${chapterId}/upload-image`,
          {
            imageBase64: base64Image,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        imageUrlToSave = imageResponse.data.imageUrl;
      }

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/chapter/${chapterId}`,
        {
          theory_content: quillContent,
          video_url: videoUrlToSave,
          image_url: imageUrlToSave,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setChapter({
        ...chapter,
        theory_content: quillContent,
        video_url: videoUrlToSave,
        image_url: imageUrlToSave,
      });

      setIsEditing(false);
      alert("Chapter updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update chapter:", error);
      alert("Failed to update chapter. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chapterDetail-teacher-container">
      <TopBar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="teacher-chapterDetail-container">
        {/* Loading and Error Handling */}
        {loading ? (
          <p>Loading chapter details...</p>
        ) : error ? (
          <p>Error loading chapter details: {error.message}</p>
        ) : chapter ? (
          <>
            <h2 className="chapterDetail-title">{chapter.chapter_name}</h2>

            <div className="chapterDetail-editorContainer">
              {/* Theory Content (Left Side) */}
              <div className="chapterDetail-content">
                {isEditing ? (
                  <ReactQuill
                    ref={quillRef}
                    value={newTheoryContent}
                    onChange={setNewTheoryContent}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ header: "1" }, { header: "2" }, { font: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["bold", "italic", "underline"],
                        ["link"],
                        ["blockquote", "code-block"],
                        [{ align: [] }],
                        ["image"],
                      ],
                    }}
                    formats={[
                      "header",
                      "font",
                      "list",
                      "bold",
                      "italic",
                      "underline",
                      "link",
                      "blockquote",
                      "code-block",
                      "image",
                      "align",
                    ]}
                    required
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: chapter.theory_content }}
                  />
                )}
              </div>

              {/* Media (Right Side) */}
              <div className="chapterDetail-mediaContainer">
                {isEditing ? (
                  <div>
                    {/* Option Selector */}
                    <div style={{ marginBottom: "20px" }}>
                      <label>
                        <input
                          type="radio"
                          name="videoOption"
                          value="youtube"
                          checked={selectedOption === "youtube"}
                          onChange={() => setSelectedOption("youtube")}
                        />
                        YouTube Link
                      </label>
                      <label style={{ marginLeft: "20px" }}>
                        <input
                          type="radio"
                          name="videoOption"
                          value="upload"
                          checked={selectedOption === "upload"}
                          onChange={() => setSelectedOption("upload")}
                        />
                        Upload Video
                      </label>
                    </div>

                    {/* YouTube Link */}
                    {selectedOption === "youtube" && (
                      <div>
                        <label>YouTube Link:</label>
                        <input
                          type="text"
                          value={youtubeLink}
                          onChange={(e) => setYoutubeLink(e.target.value)}
                          placeholder="Enter YouTube link"
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginTop: "8px",
                          }}
                        />
                      </div>
                    )}

                    {/* Upload Video */}
                    {selectedOption === "upload" && (
                      <div>
                        <label>Upload Video:</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files[0])}
                          style={{ marginTop: "8px" }}
                        />
                      </div>
                    )}

                    {/* Upload Image */}
                    <div style={{ marginTop: "20px" }}>
                      <label>Upload Image:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        style={{ marginTop: "8px" }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {chapter.video_url && (
                      <iframe
                        src={chapter.video_url}
                        title="Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="chapterDetail-iframe"
                      ></iframe>
                    )}
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Chapter"
                        className="chapterDetail-image"
                      />
                    )}
                  </>
                )}

                {/* Buttons */}
                <div className="chapterDetail-buttons">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveTheory} disabled={isUploading}>
                        {isUploading ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="chapterDetail-cancelButton"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)}>
                      Edit Chapter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ChapterDetail;