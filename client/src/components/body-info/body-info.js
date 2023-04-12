import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Select, MenuItem } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { fetchProfile, editDietPlan } from "../../helpers/users";
import "./body-info.scss";
import "./body-info-mobile.scss";

function BodyInfo() {
  const [TDEE, setTDEE] = useState();
  const [BMI, setBMI] = useState();
  const [diet, setDiet] = useState("maintain");
  const [macros, setMacros] = useState({});
  const [gender, setGender] = useState("");
  const [cookies, setCookies] = useCookies(["user"]);

  const calculateAge = (birthday) => {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const calculateTDEE = (dob, gender, height, weight, workouts) => {
    const age = calculateAge(new Date(dob));

    let BMR;
    if (gender === "male") {
      BMR = 4.536 * weight + 15.88 * height - 5 * age + 5;
    } else {
      BMR = 4.536 * weight + 15.88 * height - 5 * age - 161;
    }

    let multiplier;
    if (workouts === 0) {
      multiplier = 1.2;
    } else if (workouts <= 2) {
      multiplier = 1.375;
    } else if (workouts <= 4) {
      multiplier = 1.55;
    } else if (workouts <= 6) {
      multiplier = 1.725;
    } else {
      multiplier = 1.9;
    }

    return Math.round(BMR * multiplier);
  };

  const calculateBMI = (height, weight) => {
    return ((weight / Math.pow(height, 2)) * 703).toFixed(1);
  };

  // recalculates macros when diet plan changes
  useEffect(() => {
    let totalCal = TDEE;
    if (diet === "bulk") {
      totalCal += 500;
    } else if (diet === "cut") {
      totalCal -= 500;
    } else if (diet === "bulk-high") {
      totalCal += 1000;
    } else if (diet === "cut-high") {
      totalCal -= 1000;
    }
    setMacros({
      fat: (totalCal * 0.25) / 9,
      carbs: (totalCal * 0.5) / 4,
      protein: (totalCal * 0.25) / 4,
    });
  }, [diet, TDEE]);

  // fetches user data via API call, then sets gender, tdee, bmi, and diet state vars
  useEffect(() => {
    if (cookies.userId) {
      fetchProfile(cookies.userId).then((res) => {
        if (res.type === "success") {
          // extracts relevant fields from user in API response
          const user = res.data[0];
          const {
            diet_plan,
            dob,
            gender,
            height_inches,
            weight_pounds,
            workout_frequency,
          } = user;

          // calculates TDEE
          const newTDEE = calculateTDEE(
            dob,
            gender,
            height_inches,
            weight_pounds,
            workout_frequency
          );

          // calculates BMI
          const newBMI = calculateBMI(height_inches, weight_pounds);

          // sets gender, tdee, bmi, and diet state vars
          setGender(gender);
          setDiet(diet_plan);
          setBMI(newBMI);
          setTDEE(newTDEE);
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  // edits user's diet_plan via patch API call
  const handleDietPlanEdit = (newDiet) => {
    editDietPlan(parseInt(cookies.userId), newDiet).then((res) => {
      if (res.type === "success") {
        setDiet(res.data[0].diet_plan);
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="body-info">
      <h5>Fitness Plan</h5>

      <p>
        TDEE: {TDEE} calories | BMI: {BMI}
      </p>

      <div className="diet-select">
        <p>current physique goal:</p>
        <Select
          value={diet}
          onChange={(e) => handleDietPlanEdit(e.target.value)}
        >
          <MenuItem value="cut-high">intense cut (-2 lbs per week)</MenuItem>
          <MenuItem value="cut"> moderate cut (-1 lb per week)</MenuItem>
          <MenuItem value="maintenance">
            maintain body weight (+0 lbs per week)
          </MenuItem>
          <MenuItem value="bulk">moderate bulk (+1 lb per week)</MenuItem>
          <MenuItem value="bulk-high">intense bulk (+2 lbs per week)</MenuItem>
        </Select>
      </div>

      <TableContainer
        component={Paper}
        sx={{ marginTop: "40px", marginBottom: "40px", width: "90%" }}
      >
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">fat</TableCell>
              <TableCell align="center">carbs</TableCell>
              <TableCell align="center">protein</TableCell>
              <TableCell align="center">calories</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">{Math.round(macros.fat)}</TableCell>
              <TableCell align="center">{Math.round(macros.carbs)}</TableCell>
              <TableCell align="center">{Math.round(macros.protein)}</TableCell>
              <TableCell align="center">
                {Math.round(
                  macros.fat * 9 + macros.carbs * 4 + macros.protein * 4
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default BodyInfo;
