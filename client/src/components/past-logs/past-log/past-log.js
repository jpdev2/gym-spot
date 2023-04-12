import "./past-log.scss";
import "./past-log-mobile.scss";

function PastLog({ date, cal }) {
  return (
    <div className="past-log">
      <p>{date.split("T")[0]}</p>
      <p>
        {cal.toFixed(0)}
        <span className="mobile-label"> cal</span>
      </p>
    </div>
  );
}

export default PastLog;
