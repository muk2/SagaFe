import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("https://sagaapi.onrender.com/token")
      .then(res => {
        setMessage(res.data.token);  // FIX
      })
      .catch(err => {
        console.error("API error:", err);
        setMessage("Error fetching API");
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img 
          src="https://i.ebayimg.com/images/g/UKIAAOSwLOViWckO/s-l1200.jpg" 
          className="App-logo" 
          alt="logo" 
        />
        <p>Saga Home</p>

        <p style={{ marginTop: '20px', fontSize: '20px' }}>
          {message || "Loading..."}
        </p>
      </header>
    </div>
  );
}

export default App;