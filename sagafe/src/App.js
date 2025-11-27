import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")
      .then(res => {
        setMessage(res.data);
        console.log(res.data);
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

        {/* Display API result */}
        <p style={{ marginTop: '20px', fontSize: '20px' }}>
          {message || "Loading..."}
        </p>
      </header>
    </div>
  );
}

export default App;