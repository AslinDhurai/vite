import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [success, setSuccess] = useState('');

  const getData = async (name = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/greet?name=${name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.text();
      console.log(result)
      setData(result);
      if (name) {
        setInput('');
        setSuccess(`Successfully greeted ${name}!`);
        setTimeout(() => setSuccess(''), 3000); 
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setSuccess('');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      getData(input);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="app-container">
      <div className="glass-card">
        <header className="app-header">
          <h1 className="app-title">✨ CI/CD Testing</h1>
          <p className="app-subtitle">Welcome! Enter a name to get started</p>
        </header>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a name..."
              className="form-input"
              disabled={loading}
            />
            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Greet'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <svg className="success-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {success}
          </div>
        )}

        {!initialLoad && data.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Greeting Message</th>
                </tr>
              </thead>
              <tbody>
                  <tr className="fade-in">
                    <td>
                      <div className="greeting-message">
                        <span className="greeting-icon">👋</span>
                        {data}!
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;