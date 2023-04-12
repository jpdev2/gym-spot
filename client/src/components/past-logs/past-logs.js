import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import PastLog from "./past-log/past-log";
import { getDietLogSummaries } from "../../helpers/diet-logs";
import "./past-logs.scss";
import "./past-logs-mobile.scss";

function PastLogs() {
  const [cookies, setCookies] = useCookies(["user"]);
  const [pastLogs, setPastLogs] = useState([]);

  // fetches user's dietlog summaries, sets state var "pastLogs" if successful response
  useEffect(() => {
    if (cookies.userId) {
      getDietLogSummaries(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setPastLogs(res.data);
        } else if (res.type === "success") {
          console.warn(
            `getDietLogSummaries: no dietlog summaries for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  return (
    <div className="past-logs">
      <h5>Past Logs</h5>
      <div className="headers">
        <p>Date</p>
        <p>Calories</p>
      </div>
      <div className="content">
        {pastLogs.map((log) => {
          return <PastLog date={log.date} cal={log.total_cal} />;
        })}
      </div>
    </div>
  );
}

export default PastLogs;
