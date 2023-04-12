import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import {
  OutlinedInput,
  FormLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/lab";
import { fetchProfile, patchUser } from "../../helpers/users";
import "./personal-settings.scss";
import "./personal-settings_mobile.scss";

function PersonalSettings() {
  const [cookies, setCookies] = useCookies();
  const [settings, setSettings] = useState();

  useEffect(() => {
    if (cookies.userId) {
      fetchProfile(cookies.userId).then((res) => {
        if (res.type === "success") {
          setSettings(res.data[0]);
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  const handleChange = (key, value) => {
    let newValue = value;

    if (key === "dob") {
      const dobMonth = value.getMonth() + 1;
      const dobDate = value.getDate();
      const dobYear = value.getFullYear();

      newValue = `${dobMonth >= 10 ? dobMonth : `0${dobMonth}`}/${
        dobDate >= 10 ? dobDate : `0${dobDate}`
      }/${dobYear}`;
    }

    // fixes issue with decimal inside input without trailing values
    if (key === "weight_pounds" && value && value.split(".")[1] !== "") {
      newValue = parseFloat(value);
    }

    setSettings((prevSettings) => {
      return {
        ...prevSettings,
        [key]: newValue,
      };
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    patchUser(settings).then((res) => {
      if (res.type === "success") {
        alert("Personal information successfully edited!");
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  const numberRange = (start, end) => {
    return new Array(end - start).fill().map((d, i) => i + start);
  };

  const renderHeight = (inches) => {
    return `${Math.floor(inches / 12)}' ${inches % 12}"`;
  };

  return (
    <div className="personal-settings">
      <h5>Personal Information</h5>
      {settings && (
        <div className="form">
          <div className="row">
            <div className="col">
              <FormLabel>First Name</FormLabel>
              <OutlinedInput
                placeholder="first name"
                fullWidth
                value={settings.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>
            <div className="col">
              <FormLabel>Last Name</FormLabel>
              <OutlinedInput
                placeholder="last name"
                fullWidth
                value={settings.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <FormLabel>Birthdate</FormLabel>
              <DatePicker
                views={["day", "month", "year"]}
                value={settings.dob}
                onChange={(newDate) => handleChange("dob", newDate)}
                renderInput={(params) => (
                  <TextField {...params} helperText={null} />
                )}
                fullWidth
              />
            </div>
            <div className="col">
              <FormLabel>Gender</FormLabel>
              <Select
                value={settings.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <MenuItem value="male">male</MenuItem>
                <MenuItem value="female">female</MenuItem>
              </Select>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <FormLabel>Height</FormLabel>
              <Select
                value={settings.height_inches}
                onChange={(e) => handleChange("height_inches", e.target.value)}
                fullWidth
              >
                {numberRange(22, 107).map((inch) => {
                  return (
                    <MenuItem value={inch} key={inch}>
                      {renderHeight(inch)}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
            <div className="col">
              <FormLabel>Weight</FormLabel>
              <OutlinedInput
                placeholder="lbs"
                fullWidth
                value={settings.weight_pounds}
                onChange={(e) => handleChange("weight_pounds", e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <FormLabel>Workouts (per week)</FormLabel>
              <Select
                value={settings.workout_frequency}
                onChange={(e) =>
                  handleChange("workout_frequency", e.target.value)
                }
                fullWidth
              >
                {[...Array(7).keys()]
                  .map((i) => i + 1)
                  .map((day) => {
                    return (
                      <MenuItem value={day} key={day}>
                        {day}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
            <div className="col">
              <FormLabel>Diet Plan</FormLabel>
              <Select
                value={settings.diet_plan}
                onChange={(e) => handleChange("diet_plan", e.target.value)}
                fullWidth
              >
                <MenuItem value="cut-high">
                  intense cut (-2 lbs per week)
                </MenuItem>
                <MenuItem value="cut"> moderate cut (-1 lb per week)</MenuItem>
                <MenuItem value="maintenance">
                  maintain body weight (+0 lbs per week)
                </MenuItem>
                <MenuItem value="bulk">moderate bulk (+1 lb per week)</MenuItem>
                <MenuItem value="bulk-high">
                  intense bulk (+2 lbs per week)
                </MenuItem>
              </Select>
            </div>
          </div>
        </div>
      )}

      <button className="save-button" onClick={updateProfile}>
        Save Info
      </button>
    </div>
  );
}

export default PersonalSettings;
