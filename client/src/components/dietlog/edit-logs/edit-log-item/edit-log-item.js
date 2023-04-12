import { OutlinedInput } from "@mui/material";
import "./edit-log-item.scss";

function EditLogItem({ log, setLogs }) {
  const handleLogEdit = (e, newWeight) => {
    e.preventDefault();
    setLogs((prevLogs) => {
      return prevLogs.map((l) => {
        if (l.id === log.id) {
          // fixes issue with decimal inside input without trailing values
          if (
            newWeight &&
            newWeight.includes(".") &&
            newWeight.split(".")[1] === ""
          ) {
            return {
              ...log,
              consumed_weight: newWeight,
            };
          }
          return {
            ...log,
            consumed_weight: !isNaN(parseFloat(newWeight))
              ? parseFloat(newWeight)
              : 0,
          };
        }
        return l;
      });
    });
  };

  const isDeleted = log.consumed_weight === 0;

  return (
    <div className="edit-log-item">
      <p>{log.name}</p>
      <OutlinedInput
        className="size-input"
        value={log.consumed_weight}
        onChange={(e) => handleLogEdit(e, e.target.value)}
      />
      <button
        className={
          isDeleted ? "delete-button delete-button-disabled" : "delete-button"
        }
        disabled={isDeleted}
        onClick={(e) => handleLogEdit(e, 0)}
      >
        x
      </button>
    </div>
  );
}

export default EditLogItem;
