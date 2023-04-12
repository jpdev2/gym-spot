import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Modal, Select, MenuItem } from "@mui/material";
import EditLogs from "./edit-logs/edit-logs";
import LogItem from "./log-item/log-item";
import { getDietLogDates, getDietLogsByDate } from "../../helpers/diet-logs";
import "./dietlog.scss";
import "./dietlog-mobile.scss";

function DietLog() {
  const [cookies, setCookies] = useCookies(["user"]);
  const [log, setLog] = useState([]);
  const [editing, setEditing] = useState(false);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState();

  // fetches user's dietlog dates, sets state var "dates" if successful response
  useEffect(() => {
    if (cookies.userId) {
      getDietLogDates(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setDates(res.data.map((d) => d.split("T")[0]));
        } else if (res.type === "success") {
          console.warn(
            `getDietLogDates: no dietlog dates for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  // sets selectedDate to most recent date available
  useEffect(() => {
    if (dates.length) {
      setSelectedDate(dates[dates.length - 1]);
    }
  }, [dates]);

  // gets all dietlogs for selectedDate
  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    const dateSplit = selectedDate.split("-");
    const formattedDate = [dateSplit[1], dateSplit[2], dateSplit[0]].join("-");
    getDietLogsByDate(cookies.userId, formattedDate).then((res) => {
      if (res.type === "success" && res.data) {
        setLog(res.data);
      } else if (res.type === "success") {
        console.warn(
          `getDietLogsByDate: no dietlog for user with id = ${cookies.userId} and date = ${formattedDate}`
        );
      } else {
        console.error(res);
      }
    });
  }, [selectedDate]);

  const totalMacro = (macroType) => {
    let macro = 0;
    if (macroType === "fat") {
      log.forEach((food) => {
        macro += food.consumed_fat;
      });
    } else if (macroType === "carbs") {
      log.forEach((food) => {
        macro += food.consumed_carbs;
      });
    } else {
      log.forEach((food) => {
        macro += food.consumed_protein;
      });
    }
    return macro;
  };

  const totalCal = () => {
    return (
      totalMacro("fat") * 9 +
      totalMacro("carbs") * 4 +
      totalMacro("protein") * 4
    );
  };

  return (
    <div className="dietlogs">
      <div className="main-header">
        <div className="left-content">
          <h5>Diet Log</h5>
          <button
            disabled={!log.length}
            onClick={() => setEditing(true)}
            className="edit-button"
          >
            Edit
          </button>
        </div>
        <Select
          className="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          displayEmpty={true}
          renderValue={(value) =>
            value?.length
              ? Array.isArray(value)
                ? value.join(", ")
                : value
              : selectedDate
          }
        >
          {dates.length > 0 &&
            dates.map((d) => {
              return <MenuItem value={d}>{d}</MenuItem>;
            })}
        </Select>
      </div>
      <div className="headers">
        <p>Food Name</p>
        <p className="centered">Amount</p>
        <p className="centered">Fat</p>
        <p className="centered">Carbs</p>
        <p className="centered">Protein</p>
        <p className="centered">Calories</p>
      </div>
      <div className="logs">
        {log.length ? (
          log.map((l) => {
            return <LogItem log={l} key={Math.floor(Math.random() * 10000)} />;
          })
        ) : (
          <p className="select-date-message">
            No date selected. Please select a date to view the corresponding
            diet log.
          </p>
        )}
      </div>
      <div className="totals">
        <p>Total</p>
        <p></p>
        <p>{Math.round(totalMacro("fat"))}</p>
        <p>{Math.round(totalMacro("carbs"))}</p>
        <p>{Math.round(totalMacro("protein"))}</p>
        <p>{Math.round(totalCal())}</p>
      </div>
      <Modal open={editing} onClose={() => setEditing(false)}>
        <EditLogs logItems={log} setEditing={setEditing} />
      </Modal>
    </div>
  );
}

export default DietLog;
