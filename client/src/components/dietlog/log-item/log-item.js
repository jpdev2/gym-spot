import "./log-item.scss";

function LogItem({ log }) {
  const {
    name,
    consumed_weight,
    consumed_fat,
    consumed_carbs,
    consumed_protein,
    consumed_cal,
  } = log;

  return (
    <div className="log-item">
      <p className="food-name">{name}</p>
      <p className="centered">{consumed_weight}</p>
      <p className="centered">{Math.round(consumed_fat)}</p>
      <p className="centered">{Math.round(consumed_carbs)}</p>
      <p className="centered">{Math.round(consumed_protein)}</p>
      <p className="centered">{Math.round(consumed_cal)}</p>
    </div>
  );
}

export default LogItem;
