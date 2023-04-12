import { Button, CircularProgress, Modal } from "@mui/material";
import "./fitbit-upload.scss";

function FitbitUpload({
  open,
  file,
  uploading,
  handleClose,
  handleChange,
  handleSubmit,
}) {
  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fitbit-upload">
        <h5>FitBit Data Upload</h5>
        <p>
          Instructions: Export your FitBit account archive using this{" "}
          <a
            href="https://help.fitbit.com/articles/en_US/Help_article/1133.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            link
          </a>
          , then click the upload button and select the downloaded ".zip" file.
        </p>
        <div className="form-container">
          {!uploading ? (
            <Button variant="contained" component="label">
              {file?.name ?? "Upload File"}
              <input type="file" hidden onChange={handleChange} />
            </Button>
          ) : (
            <CircularProgress />
          )}
        </div>
        <div className="buttons">
          <button onClick={handleClose} className="cancel-button">
            Cancel
          </button>
          {!uploading && (
            <button onClick={handleSubmit} className="upload-button">
              Upload
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default FitbitUpload;
