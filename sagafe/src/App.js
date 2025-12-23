import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function App() {
  return (
        <div>
        <img src="https://i.ebayimg.com/images/g/UKIAAOSwLOViWckO/s-l1200.jpg" className="App-logo" alt="logo" />
        <p>
          Saga Home
        </p>
        </div>
  );
}

export function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch data from the FastAPI backend endpoint
        const response = await axios.get('http://localhost:8000/api/items'); 
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);
  return (
    <div>
      <h1>Golf Courses 2026</h1>
      <ul>
        {items.map((item) => (
          <li>{item.golf_course} in {item.township}</li> 
        ))}
      </ul>
    </div>
  );
}



