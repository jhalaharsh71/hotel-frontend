import slide1 from "../../../assets/banner1.webp";
import "./home.css";

function About() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6 col-md-12">
            <img src={slide1} alt="About us" className="about-img" />
          </div>

          <div className="col-lg-6 col-md-12 text-white">
            <h2>About Our Hotel</h2>
            <p>
              We provide world-class hospitality with modern rooms, premium
              services, and a peaceful environment. Our goal is to make your
              stay comfortable and memorable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
