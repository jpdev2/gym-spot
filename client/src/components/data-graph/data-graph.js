import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { MobileDatePicker } from "@mui/lab";
import { FormLabel, TextField } from "@mui/material";
import Plot from "react-plotly.js";
import { getDataBounds, getUserData } from "../../helpers/data-svc";
import "./data-graph.scss";

function DataGraph() {
  const [cookies, setCookies] = useCookies();
  const [min, setMin] = useState();
  const [max, setMax] = useState();
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [tdeeData, setTdeeData] = useState();
  const [dietData, setDietData] = useState();

  // gets bounding timestamps for user's FitBit data
  useEffect(() => {
    if (cookies.userId) {
      getDataBounds(cookies.userId).then((data) => {
        if (data?.min && data?.max) {
          setMin(new Date(data.min * 1000));
          setMax(new Date(data.max * 1000));
          setStart(new Date(data.min * 1000));
          setEnd(new Date(data.max * 1000));
        } else {
          console.error("Error retrieving min and max via getDataBounds()");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (start && end && start >= min && end <= max) {
      const startEpoch = start.valueOf() / 1000;
      const endEpoch = end.valueOf() / 1000;

      getUserData(startEpoch, endEpoch, cookies.userId).then((res) => {
        if (res.type === "success") {
          setTdeeData({
            x: res.data.tdee.dates.map((d) => new Date(d)),
            y: res.data.tdee.calories,
          });
          setDietData({
            x: res.data.diet.dates.map((d) => new Date(d)),
            y: {
              fat: res.data.diet.fat,
              carbs: res.data.diet.carbs,
              protein: res.data.diet.protein,
              cal: res.data.diet.cal,
            },
          });
        } else {
          console.error(res);
        }
      });
    }
  }, [start, end]);

  return (
    <div className="data-graph">
      <h5>Calorie Trends</h5>
      <div className="range-picker">
        <div className="col">
          <FormLabel>Start Date</FormLabel>
          <MobileDatePicker
            views={["day", "month", "year"]}
            value={start}
            minDate={min}
            maxDate={max}
            onChange={(newDate) => {
              setStart(newDate);
            }}
            renderInput={(params) => (
              <TextField {...params} helperText={null} />
            )}
            fullWidth
          />
        </div>
        <div className="col">
          <FormLabel>End Date</FormLabel>
          <MobileDatePicker
            views={["day", "month", "year"]}
            value={end}
            minDate={min}
            maxDate={max}
            onChange={(newDate) => {
              setEnd(newDate);
            }}
            renderInput={(params) => (
              <TextField {...params} helperText={null} />
            )}
            fullWidth
          />
        </div>
      </div>
      <div className="graph-container">
        <Plot
          data={[
            {
              x: tdeeData?.x ?? [],
              y: tdeeData?.y ?? [],
              type: "line",
              mode: "lines+markers",
              name: "Burned",
              marker: {
                color: "#bf3232",
              },
            },
            {
              x: dietData?.x ?? [],
              y: dietData?.y?.cal ?? [],
              type: "line",
              mode: "lines+markers",
              name: "Consumed",
              marker: {
                color: "#3251bf",
              },
            },
          ]}
          layout={{
            autosize: false,
            width: 750,
            height: 400,
            margin: {
              l: 60,
              r: 20,
              b: 60,
              t: 50,
              pad: 5,
            },
            title: "Calories Burned and Consumed over Time",
            xaxis: {
              title: {
                text: "Date",
              },
              fixedrange: true,
            },
            yaxis: {
              title: {
                text: "Calories",
              },
              fixedrange: true,
            },
          }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}

export default DataGraph;
