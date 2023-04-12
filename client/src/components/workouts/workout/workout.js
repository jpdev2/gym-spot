import "./workout.scss";

function Workout({ date, workout, handleEditOpen }) {
  const renderDate = () => {
    // fixes bug where converted date is one day ahead
    const formattedStr = (date + "T00:00:00")
      .replace(/-/g, "/")
      .replace(/T.+/, "");
    const newDate = new Date(formattedStr);

    return newDate.toDateString().replace(" ", ": ");
  };

  // groups exercises by muscle group
  const renderExercises = () => {
    const muscles = Object.keys(workout);

    return muscles.map((muscle) => {
      const exercises = workout[muscle];

      return (
        <div className="muscle-group" key={muscle}>
          <p className="muscle">{muscle}</p>
          {exercises.map((e) => {
            return (
              <p key={`${e.reps}-${e.weight}-${e.name}`}>
                {e.reps}: {e.weight} {e.name}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="workout">
      <div className="top-section">
        <h6>{renderDate()}</h6>
        <button onClick={() => handleEditOpen(date, workout, true)}>
          Edit
        </button>
      </div>
      <div className="content">{renderExercises()}</div>
    </div>
  );
}

export default Workout;
