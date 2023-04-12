import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { getBodyWeightsById } from "../../helpers/bodyweights";
import "./bodyweights.scss";

function BodyWeights() {
  const [cookies, setCookies] = useCookies();
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    if (cookies.userId) {
      getBodyWeightsById(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setWeights(res.data);
        } else if (res.type === "success") {
          console.warn(
            `getBodyWeightsById: no bodyweights for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  return (
    <div className="bodyweights">
      <h5>Bodyweight Log</h5>
      <div className="content">
        <div className="headers">
          <p>Date</p>
          <p>Weight (lbs)</p>
        </div>
        <div className="values">
          {weights.map((w) => {
            return (
              <div className="weight-log" key={w.id}>
                <p>{w.date.split("T")[0]}</p>
                <p>{w.weight}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BodyWeights;
