import React from "react";
import Header from "../../Component/Header";
import Footer from "../../Component/Footer";
import Banner from "./Banner";
import About from "./About";
import Service from "./Service";


function Home() {
  return (
    <>
      <Header />
      <div
        style={{
          background: "linear-gradient(135deg, #0a0e27 0%, #1a1b4b 25%, #2d3561 50%, #1a2847 75%, #0f1828 100%)",
          minHeight: "100%",
          position: "relative",
          overflow: "hidden",
          marginTop: '72px',
          
        }}
      >
        {/* Animated background gradient orbs */}
        <div
          style={{
            position: "fixed",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          
          <Banner />
          <About />
          <Service />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
