import { useState, useEffect } from 'react';
import '../Dashboard.css';
import rArrow from '../assets/right-arrow-svgrepo-com.svg';
import lArrow from '../assets/left-arrow-circle2-svgrepo-com.svg';
import placeholder from '../assets/placeholder-svgrepo-com.svg';


interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

interface SearchResult {
  resultIds: string[];
  total: number;
  next: string | null;
  prev: string | null;
}

function Dashboard() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]); 
  const [match, setMatch] = useState<Dog | null>(null); 

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder, currentPage]);

  const fetchBreeds = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://frontend-take-home-service.fetch.com/dogs/breeds',
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBreeds(data);
    } catch (error) {
      console.error('Error fetching breeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDogs = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        size: '20',
        from: ((currentPage - 1) * 20).toString(),
        sort: `breed:${sortOrder}`,
      });

      if (selectedBreed) {
        searchParams.append('breeds', selectedBreed);
      }

      const searchResponse = await fetch(
        `https://frontend-take-home-service.fetch.com/dogs/search?${searchParams}`,
        {
          credentials: 'include',
        }
      );
      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }
      const searchData: SearchResult = await searchResponse.json();

      const dogsResponse = await fetch(
        'https://frontend-take-home-service.fetch.com/dogs',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchData.resultIds),
          credentials: 'include',
        }
      );
      if (!dogsResponse.ok) {
        throw new Error(`HTTP error! status: ${dogsResponse.status}`);
      }
      const dogsData: Dog[] = await dogsResponse.json();

      setDogs(dogsData);
      setTotalPages(Math.ceil(searchData.total / 20));
    } catch (error) {
      console.error('Error fetching dogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBreedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBreed(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const toggleFavorite = (dogId: string) => {
    if (favorites.includes(dogId)) {
      setFavorites(favorites.filter((id) => id !== dogId));
    } else {
      setFavorites([...favorites, dogId]);
    }
  };

  const generateMatch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://frontend-take-home-service.fetch.com/dogs/match',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(favorites),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const matchData = await response.json();

      if (matchData && matchData.match) {
        
        const matchedDogId = matchData.match;
        const dogsResponse = await fetch(
          'https://frontend-take-home-service.fetch.com/dogs',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([matchedDogId]), 
            credentials: 'include',
          }
        );

        if (!dogsResponse.ok) {
          throw new Error(`HTTP error! status: ${dogsResponse.status}`);
        }

        const dogsData: Dog[] = await dogsResponse.json();

        if (dogsData && dogsData.length > 0) {
          setMatch(dogsData[0]);

        } else {
          setMatch(null); 
        }
      } else {
        setMatch(null); 
      }
    } catch (error) {
      console.error('Error generating match:', error);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (match) {
      const element = document.getElementById('fav-redirect');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [match]);

  return (
    <div className="dashboard">
      <div className="header">
        <img
          id="register-logo"
          src="https://cdn.brandfetch.io/id7Cm60rQf/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
          alt="Fetch Rewards Logo"
        />
        <h1 id="title">Dog Adoption Dashboard</h1>
      </div>

      <div className="filters">
        <div>
        <select
          className="breed-select"
          value={selectedBreed}
          onChange={handleBreedChange}
          disabled={loading}
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
        <select
          className="sort-select"
          value={sortOrder}
          onChange={handleSortChange}
          disabled={loading}
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
        </div>
        <div>
          <button id="top-fav" onClick={generateMatch} disabled={loading || favorites.length === 0}>
            Favorites ({favorites.length}) Generate Match
          </button>
        </div>
      </div>

      {loading ? (
        <div className="load-container">
          <div className="load"></div>
        </div>
      ) : (
        <div className="dog-grid">
          {dogs.map((dog) => (
            <div key={dog.id} className="dog-card">
              <img
                src={dog.img || placeholder}
                alt={dog.name}
                className="dog-img"
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <h3 className="dog-name">{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Zip Code: {dog.zip_code}</p>
              <button onClick={() => toggleFavorite(dog.id)}>
                {favorites.includes(dog.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <img src={lArrow} className="pagination-image" alt="Previous Page" />
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <img src={rArrow} className="pagination-image" alt="Next Page" />
        </button>
      </div>

      <div className="favorites">
        <h3>Favorites ({favorites.length})</h3>
        <button onClick={generateMatch} disabled={loading || favorites.length === 0}>
          Generate Match
        </button>
        {match ? (
          <div className="match">
            <h3>Your Match!</h3>
            <img
              src={match.img || placeholder}
              alt={match.name}
              className="dog-img fav"
              id="fav-redirect"
            />
            <h3 className="dog-name fav-name">{match.name}</h3>
            <p>Breed: {match.breed}</p>
            <p>Age: {match.age}</p>
            <p>Zip Code: {match.zip_code}</p>
          </div>
        ) : (
          favorites.length > 0 && <p>No match found. Try adding more favorites!</p>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
