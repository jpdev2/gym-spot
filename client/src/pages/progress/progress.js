import { useState } from "react";
import { useCookies } from "react-cookie";
import DataGraph from "../../components/data-graph/data-graph";
import FitbitUpload from "../../components/fitbit-upload/fitbit-upload";
import { postFitbitData } from "../../helpers/data-svc";
import "./progress.scss";

const Progress = () => {
  const [cookies, setCookies] = useCookies();
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadOpen = () => {
    setShowUpload(true);
  };

  const handleUploadClose = () => {
    setFile(null);
    setUploading(false);
    setShowUpload(false);
  };

  const changeFile = (e) => {
    setFile(e.target.files[0]);
  };

  const postData = (e) => {
    e.preventDefault();
    setUploading(true);
    postFitbitData(file, cookies.userId).then((res) => {
      if (res?.type === "success") {
        alert("FitBit data has been successfully processed!");
        window.location.reload();
      } else {
        alert(
          "Error processing FitBit data, please try again after the page reloads."
        );
        window.location.reload();
      }
    });
  };

  // use helper from users.js to check if user has data_path (if not, hide DataGraph component)

  return (
    <div className="progress-page">
      <DataGraph />
      <FitbitUpload
        open={showUpload}
        file={file}
        uploading={uploading}
        handleClose={handleUploadClose}
        handleChange={changeFile}
        handleSubmit={postData}
      />
      <button className="toggle-button" onClick={handleUploadOpen}>
        Upload Data
      </button>
    </div>
  );
};

export default Progress;
