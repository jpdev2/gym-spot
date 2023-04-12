import "./food.scss";
import "./food_mobile.scss";

function Food({ food, handleAddClick, handleDeleteClick }) {
  return (
    <div className="food">
      <div className="name-container">
        <p>{food.name}</p>
      </div>
      <p className="calories">
        {food.fat * 9 + food.carbs * 4 + food.protein * 4}
      </p>
      <button onClick={() => handleAddClick(food.id)} className="log-button">
        +
      </button>
      <button
        onClick={() => handleDeleteClick(food.id)}
        className="delete-button"
      >
        x
      </button>
    </div>
  );
}

export default Food;
