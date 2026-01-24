import { useEffect, useState } from "react";
import "./Banner.css";

export default function Banner() {
  const messages = [
    "🏌️‍♂️ Register now for 2026 premium golf events",
    "⛳ New courses this season",
    "🎉 Members get exclusive discounts",
    "📅 Book your events"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000); // rotate every 4s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner">
      <p className="banner-text">{messages[index]}</p>
    </div>
  );
}
