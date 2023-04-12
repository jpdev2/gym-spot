import { useState } from "react";
import EditLogItem from "./edit-log-item/edit-log-item";
import { editDietLogs } from "../../../helpers/diet-logs";
import "./edit-logs.scss";
import "./edit-logs-mobile.scss";

function EditLogs({ logItems, setEditing }) {
  const [logs, setLogs] = useState(logItems);

  const closeModal = (e) => {
    e.preventDefault();
    setEditing(false);
    setLogs(logItems);
  };

  const handleLogEdit = (e) => {
    e.preventDefault();

    // finds dietlogs that have been edited (quantity change or delete)
    const changes = logs.filter((l) => !logItems.includes(l));
    editDietLogs(changes).then((res) => {
      if (res.type === "success") {
        alert("Dietlogs successfully edited!");
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  const logDate = logs[0].date.split("T")[0];

  return (
    <form className="edit-logs">
      <h5>Edit Log ({logDate})</h5>
      <div className="headers">
        <p>Food</p>
        <p>Consumed Size</p>
        <p>Delete</p>
      </div>
      <div className="logs">
        {logs.map((log) => {
          return <EditLogItem key={log.id} log={log} setLogs={setLogs} />;
        })}
      </div>
      <div className="buttons">
        <button onClick={() => closeModal()} className="cancel-button">
          Cancel
        </button>
        <button onClick={(e) => handleLogEdit(e)} className="save-button">
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default EditLogs;
