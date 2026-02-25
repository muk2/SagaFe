import { useEffect, useState } from "react";
import "./Banner.css";
import { bannerApi} from "./lib/api";


export default function Banner() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [display_count, setDisplayCount] = useState(3);

  // Fetch banner messages
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerApi.getAll();
        
        console.log('=== BANNER DATA ===');
        console.log('Full response:', data);
        console.log('display_count:', data.display_count);
        console.log('messages:', data.messages);
        console.log('==================');

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
  }, []);
  

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

  return (
    <div className="banner">
      <p className="banner-text">
        {/* change `.message` if your column is named differently */}
        {visibleItems[index]?.message}
      </p>
    </div>
  );
}