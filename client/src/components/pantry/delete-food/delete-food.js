import "./delete-food.scss";
import "./delete-food-mobile.scss";

function DeleteFood({ food, deleteFood, setShowDelete }) {
  return (
    <form className="delete-food">
      <h3>Would you like to delete this food from your pantry?</h3>
      <div>
        <p>{food.name}</p>
      </div>
      <div className="buttons">
        <button className="cancel-button" onClick={() => setShowDelete(false)}>
          Cancel
        </button>
        <button
          className="delete-button"
          onClick={(e) => deleteFood(e, food.id)}
        >
          Delete Food
        </button>
      </div>
    </form>
  );
}

export default DeleteFood;
