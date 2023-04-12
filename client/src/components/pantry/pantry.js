import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Modal } from "@mui/material";
import AddFood from "./add-food/add-food";
import Food from "./food/food";
import LogFood from "./log-food/log-food";
import DeleteFood from "./delete-food/delete-food";
import { fetchFoodsByUserId, deleteFoodById } from "../../helpers/foods";
import { postDietLog } from "../../helpers/diet-logs";
import { dateToString } from "../../util/date-parse";
import "./pantry.scss";
import "./pantry_mobile.scss";

function Pantry() {
  const [cookies, setCookies] = useCookies();
  const [foods, setFoods] = useState([]);
  const [foodToAdd, setFoodToAdd] = useState();
  const [foodToDelete, setFoodToDelete] = useState();
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // fetches user's foods, sets state var "foods" if successful response
  useEffect(() => {
    if (cookies.userId) {
      fetchFoodsByUserId(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setFoods(res.data);
        } else if (res.type === "success") {
          console.warn(
            `fetchFoodsByUserId: no foods for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  const handleAddClick = (id) => {
    setFoodToAdd(foods.find((food) => food.id === id));
    setShowAdd(true);
  };

  const handleDeleteClick = (id) => {
    setFoodToDelete(foods.find((food) => food.id === id));
    setShowDelete(true);
  };

  const logFood = async (e, food, consumedSize, dateConsumed) => {
    e.preventDefault();

    postDietLog(food, consumedSize, dateToString(dateConsumed)).then((res) => {
      if (res.type === "success") {
        alert(`Food logged successfully!`);
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  const deleteFood = async (e, foodId) => {
    e.preventDefault();
    deleteFoodById(cookies.userId, foodId).then((res) => {
      if (res.type === "success") {
        alert(`Food with id = ${foodId} successfully removed from pantry.`);
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="pantry">
      <div className="pantry-header">
        <h5>Pantry</h5>
        <AddFood />
      </div>

      <div className="headers-container">
        <p>Food Name</p>
        <p className="centered">Calories</p>
        <p className="centered">Log</p>
        <p className="centered">Delete</p>
      </div>

      <div className="foods-container">
        {foods.map((food) => {
          return (
            <Food
              food={food}
              key={food.id}
              handleAddClick={handleAddClick}
              handleDeleteClick={handleDeleteClick}
            />
          );
        })}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <LogFood food={foodToAdd} logFood={logFood} setShowAdd={setShowAdd} />
      </Modal>
      <Modal open={showDelete} onClose={() => setShowDelete(false)}>
        <DeleteFood
          food={foodToDelete}
          deleteFood={deleteFood}
          setShowDelete={setShowDelete}
        />
      </Modal>
    </div>
  );
}

export default Pantry;
