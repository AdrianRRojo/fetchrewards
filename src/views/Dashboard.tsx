import { useState, useEffect } from 'react';
import '../Dashboard.css';

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
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    fetchBreeds();
  }, []); // Fetch breeds on component mount

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder, currentPage]); // Fetch dogs when dependencies change

  const fetchBreeds = async () => {
    setLoading(true); // Start loading
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
      setLoading(false); // Stop loading
    }
  };

  const fetchDogs = async () => {
    setLoading(true); // Start loading
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
      setLoading(false); // Stop loading
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

  return (
    <div className="dashboard">
      <h1>Dog Adoption Dashboard</h1>
      <div className="filters">
        <select
          className="breed-select"
          value={selectedBreed}
          onChange={handleBreedChange}
          disabled={loading} // Disable while loading
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
          disabled={loading} // Disable while loading
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
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
                src={dog.img || '/placeholder.svg'}
                alt={dog.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <h3>{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Zip Code: {dog.zip_code}</p>
            </div>
          ))}
        </div>
      )}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading} // Disable while loading
        >
          Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading} // Disable while loading
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
