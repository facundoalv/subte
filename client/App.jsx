import { useState } from 'react';

function App() {
  const [sentimiento, setSentimiento] = useState('');
  const [genero, setGenero] = useState('rock'); // Género por defecto
  const [canciones, setCanciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  const buscarMusica = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentimiento, genero })
      });

      const data = await response.json();
      
      if (data.canciones) {
        setCanciones(data.canciones);
      } else {
        alert("No se encontraron canciones.");
      }
    } catch (error) {
      console.error("Error conectando al server:", error);
      alert("Hubo un error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', color: '#bfc299' }}>vinyldream</h1>
        <p>Tu estado de ánimo dictará la próxima estación musical.</p>
      </header>

      <form onSubmit={buscarMusica} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <textarea
          value={sentimiento}
          onChange={(e) => setSentimiento(e.target.value)}
          placeholder="Ej: Me siento con mucha energía pero un poco melancólico..."
          required
          style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: 'none' }}
        />
        
        <div style={{ marginBottom: '20px' }}>
          <label>Género base: </label>
          <select 
            value={genero} 
            onChange={(e) => setGenero(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', marginLeft: '10px' }}
          >
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="techno">Techno</option>
            <option value="jazz">Jazz</option>
            <option value="metal">Metal</option>
            <option value="indie">Indie</option>
            <option value="reggaeton">Reggaeton</option>
          </select>
        </div>

        <button 

          type="submit" 
          disabled={cargando}
          style={{ padding: '15px 30px', backgroundColor: '#bfc299', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {cargando ? 'Analizando...' : 'BUSCAR CANCIONES'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '50px' }}>
        {canciones.map((track) => (
          <div key={track.id} style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <img src={track.album.images[0].url} alt={track.name} style={{ width: '100%', borderRadius: '5px' }} />
            <h4 style={{ margin: '10px 0 5px' }}>{track.name}</h4>
            <p style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>{track.artists[0].name}</p>
            <a href={track.external_urls.spotify} target="_blank" rel="noreferrer" style={{ color: '#1DB954', textDecoration: 'none', fontSize: '0.8rem' }}>
              Escuchar en Spotify
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;