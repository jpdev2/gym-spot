import { useState } from "react";
import { useCookies } from "react-cookie";
import { Modal, OutlinedInput } from "@mui/material";
import { postFood } from "../../../helpers/foods";
import "./add-food.scss";
import "./add-food-mobile.scss";

function AddFood() {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [cookies, setCookies] = useCookies(["user"]);

  const cancelAdd = (e) => {
    e.preventDefault();
    setShowAdd(false);
  };

  const addFood = (e) => {
    e.preventDefault();
    const calories =
      parseFloat(fat) * 9 + parseFloat(carbs) * 4 + parseFloat(protein) * 4;
    postFood(
      name,
      parseFloat(servingSize),
      parseFloat(fat),
      parseFloat(carbs),
      parseFloat(protein),
      calories,
      parseInt(cookies.userId)
    ).then((res) => {
      if (res.type === "success") {
        alert("New food successfully added!");
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="add-food-container">
      <button onClick={() => setShowAdd(true)} className="toggle-button">
        New Food
      </button>
      <Modal open={showAdd} onClose={cancelAdd}>
        <form className="add-food">
          <h5>New Food</h5>
          <div className="form-container">
            <div className="headers">
              <p>Food Name</p>
              <p></p>
              <p>Serving Size</p>
              <p>Fat</p>
              <p>Carbs</p>
              <p>Protein</p>
            </div>
            <div className="inputs">
              <OutlinedInput
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div></div>
              <OutlinedInput
                placeholder="grams"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
              />
              <OutlinedInput
                placeholder="grams"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
              <OutlinedInput
                placeholder="grams"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <OutlinedInput
                placeholder="grams"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
          </div>

          <div className="buttons">
            <button onClick={() => cancelAdd()} className="cancel-button">
              cancel
            </button>
            <button onClick={(e) => addFood(e)} className="add-button">
              add food
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AddFood;
