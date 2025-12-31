import { useState, useEffect } from "react";
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setloading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_rank');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true'
        );
        setCoins(response.data);
        setloading(false);
      } catch (error) {
        console.error('API Error:', error);
        setloading(false);
      }
    };
    fetchCoins();
  }, []);

  // Analysis Calculations
  const avgPrice = coins.length > 0 ? coins.reduce((acc, curr) => acc + curr.current_price, 0) / coins.length : 0;
  const topGainer = coins.length > 0 ? [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0] : null;

  const sortedCoins = [...coins].sort((a, b) => {
    if (sortBy === 'current_price') return b.current_price - a.current_price;
    if (sortBy === 'price_change_percentage_24h') return b.price_change_percentage_24h - a.price_change_percentage_24h;
    return a.market_cap_rank - b.market_cap_rank;
  });

  const getPrediction = (change) => {
    if (change > 5) return { label: "BULLISH", bgColor: "rgba(0, 255, 135, 0.1)", color: "#00FF87", border: "1px solid #00FF87" };
    if (change < -5) return { label: "HIGH RISK", bgColor: "rgba(255, 77, 77, 0.1)", color: "#FF4D4D", border: "1px solid #FF4D4D" };
    return { label: "STABLE", bgColor: "rgba(255, 179, 0, 0.1)", color: "#FFB300", border: "1px solid #FFB300" };
  };

  const colors = { bg: "#000000", card: "#111111", accent: "#FFB300", green: "#00FF87", red: "#FF4D4D" };

  return (
    <div style={{ 
      backgroundColor: colors.bg, 
      color: 'white', 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', // Sab kichu center-e
      padding: '40px 20px', 
      boxSizing: 'border-box' 
    }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #FFD700, #FFA500, #FF4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>
       CryptoPulse Analytics
        </h1>
        <p style={{ color: colors.green, fontSize: '1.2rem', marginTop: '10px' }}>From Noise to Knowledge – Your Crypto Compass.</p>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center', width: '100%', maxWidth: '1200px', flexWrap: 'wrap' }}>
        {[
          { label: "Market Mean Price", val: `$${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, borderColor: colors.accent },
          { label: "🔥 Top Gainer (24h)", val: `${topGainer?.name} (+${topGainer?.price_change_percentage_24h.toFixed(2)}%)`, borderColor: colors.green },
          { label: "Analysis Nodes", val: "50 Live Assets", borderColor: "#444" }
        ].map((stat, i) => (
          <div key={i} style={{ flex: '1', minWidth: '300px', backgroundColor: colors.card, padding: '25px', borderRadius: '15px', borderLeft: `5px solid ${stat.borderColor}`, textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>{stat.label}</p>
            <h2 style={{ fontSize: '1.6rem', margin: '0' }}>{stat.val}</h2>
          </div>
        ))}
      </div>

      {/* Control Panel (Search & Sort) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center', width: '100%', maxWidth: '1100px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search Asset..." 
          style={{ padding: '15px 25px', width: '400px', borderRadius: '30px', border: `2px solid ${colors.accent}`, backgroundColor: colors.card, color: 'white', outline: 'none' }} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select 
          onChange={(e) => setSortBy(e.target.value)} 
          style={{ padding: '10px 20px', borderRadius: '30px', backgroundColor: colors.card, color: colors.accent, border: `1px solid ${colors.accent}`, cursor: 'pointer' }}
        >
          <option value="market_cap_rank">Sort by Rank</option>
          <option value="current_price">Sort by Price</option>
          <option value="price_change_percentage_24h">Sort by Growth</option>
        </select>
      </div>

      {/* Main Analysis Table with NEON Border */}
      {loading ? (
        <h2 style={{ color: colors.accent }}>Computing Real-time Data...</h2>
      ) : (
        <div className="neon-border-wrapper" style={{ width: '100%', maxWidth: '1100px' }}>
          <div className="neon-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', color: colors.accent }}>
                    <th style={{ padding: '20px' }}>Rank</th>
                    <th>Asset</th>
                    <th>Price (USD)</th>
                    <th>24h Dynamics</th>
                    <th>Risk Signal</th>
                    <th style={{ textAlign: 'center' }}>7D Volatility (EDA)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCoins.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((coin) => {
                    const signal = getPrediction(coin.price_change_percentage_24h);
                    const chartData = coin.sparkline_in_7d.price.map((p) => ({ price: p }));
                    return (
                      <tr key={coin.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '18px', color: '#555' }}>{coin.market_cap_rank}</td>
                        <td style={{ display: 'flex', alignItems: 'center', padding: '18px' }}>
                          <img src={coin.image} alt={coin.name} width='25' style={{ marginRight: '12px' }} />
                          <span style={{ fontWeight: 'bold' }}>{coin.name}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>${coin.current_price.toLocaleString()}</td>
                        <td style={{ color: coin.price_change_percentage_24h > 0 ? colors.green : colors.red, fontWeight: 'bold' }}>
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </td>
                        <td>
                          <span style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', backgroundColor: signal.bgColor, color: signal.color, border: signal.border }}>
                            {signal.label}
                          </span>
                        </td>
                        <td style={{ width: '180px', height: '60px', padding: '10px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <Line type="monotone" dataKey="price" stroke={coin.price_change_percentage_24h > 0 ? colors.green : colors.red} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#444', borderTop: '1px solid #111', paddingTop: '20px', width: '100%' }}>
        CipherScope Intelligence v1.0 | Data Science EDA Project
      </footer>
    </div>
  );
}

export default App;