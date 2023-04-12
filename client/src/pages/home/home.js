import BodyInfo from "../../components/body-info/body-info";
import BodyWeights from "../../components/bodyweights/bodyweights";
import LogWeight from "../../components/log-weight/log-weight";
import "./home.scss";

function Home() {
  return (
    <div className="home-page">
      <BodyInfo />
      <BodyWeights />
      <LogWeight />
    </div>
  );
}

export default Home;
