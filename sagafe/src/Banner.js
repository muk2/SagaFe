import { useEffect, useState } from "react";
import "./Banner.css";
import { bannerApi} from "./lib/api";


export default function Banner() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banner messages
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerApi.getAll();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError("Unable to load banner messages");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Rotate banner messages
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (loading || error || items.length === 0) {
    return "error"; // or return a fallback banner
  }

  return (
    <div className="banner">
      <p className="banner-text">
        {/* change `.message` if your column is named differently */}
        {items[index].message}
      </p>
    </div>
  );
}