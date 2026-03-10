import { useEffect, useState } from "react";
import "./Banner.css";
import { bannerApi} from "./lib/api";


export default function Banner() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [display_count, setDisplayCount] = useState(3);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for banner updates from admin dashboard
  useEffect(() => {
    const handleBannerUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("banner-updated", handleBannerUpdate);
    return () => window.removeEventListener("banner-updated", handleBannerUpdate);
  }, []);

  // Fetch banner messages
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerApi.getAll();

        setDisplayCount(data.display_count || 3);
        setItems(data.messages || data);  // Fallback for old format

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
  }, [refreshKey]);
  

  // Rotate banner messages
  useEffect(() => {

    const visibleItems = items.slice(0, display_count);

    if (items.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length, display_count]);

  if (loading || error || items.length === 0) {
    return null; // or return a fallback banner
  }

  const visibleItems = items.slice(0, display_count);
  const safeIndex = index % (visibleItems.length || 1);

  return (
    <div className="banner">
      <p className="banner-text">
        {visibleItems[safeIndex]?.message}
      </p>
    </div>
  );
}