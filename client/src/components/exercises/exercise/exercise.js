import "./exercise.scss";

function Exercise({ name, handleLog, handleDelete }) {
  return (
    <div className="exercise">
      <div className="name-container">
        <p>{name}</p>
      </div>
      <button className="log-button" onClick={(e) => handleLog(e, name)}>
        +
      </button>
      <button className="delete-button" onClick={(e) => handleDelete(e, name)}>
        x
      </button>
    </div>
  );
}

export default Exercise;
