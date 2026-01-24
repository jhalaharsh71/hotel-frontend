import slide1 from "../../../assets/banner1.webp";
import slide2 from "../../../assets/banner2.webp";
import slide3 from "../../../assets/banner3.webp";
import slide4 from "../../../assets/hotel-room.webp";
import "./home.css";
import { Carousel, Container } from "react-bootstrap";
import CheckHotel from "./CheckHotel";

function Banner() {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Banner Carousel */}
      <Carousel fade interval={3000} pause={false}>
        
        <Carousel.Item>
          <img className="banner-img" src={slide1} alt="Banner 1" />
          <Carousel.Caption>
            <h3>Luxury & Comfort</h3>
            <p>Experience premium hospitality</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img className="banner-img" src={slide2} alt="Banner 2" />
          <Carousel.Caption>
            <h3>Luxury & Comfort</h3>
            <p>Experience premium hospitality</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img className="banner-img" src={slide3} alt="Banner 3" />
          <Carousel.Caption>
            <h3>Luxury & Comfort</h3>
            <p>Experience premium hospitality</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img className="banner-img" src={slide4} alt="Banner 4" />
          <Carousel.Caption>
            <h3>Luxury & Comfort</h3>
            <p>Experience premium hospitality</p>
          </Carousel.Caption>
        </Carousel.Item>

      </Carousel>

      {/* CheckHotel Form Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '900px',
          zIndex: 10,
        }}
      >
        <CheckHotel />
      </div>
    </div>
  );
}

export default Banner;
