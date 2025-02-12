
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import "../Dashboard.css"

interface Dog {
    id: string
    img: string
    name: string
    age: number
    zip_code: string
    breed: string
}
  
interface SearchResult {
    resultIds: string[]
    total: number
    next: string | null
    prev: string | null
}

function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [breeds, setBreeds] = useState<string[]>([])
    const [selectedBreed, setSelectedBreed] = useState<string>("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [dogs, setDogs] = useState<Dog[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
      setMessage('');
      try {
        const response = await fetch(
          'https://frontend-take-home-service.fetch.com/auth/logout',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );
  
        if (response.ok) {
          setMessage('Logout successful!');
          setIsLoggedIn(false);
          navigate('/');
        } else {
          setMessage('Logout failed. Please try again.');
        }
      } catch (error) {
        setMessage('An error occurred. Please try again later.');
      }
    };
  
  
    const fetchBreeds = async () => {
        try {
          const response = await fetch("https://frontend-take-home-service.fetch.com/dogs/breeds", {
            credentials: "include",
          })
          const data = await response.json()
          setBreeds(data)
        } catch (error) {
          console.error("Error fetching breeds:", error)
        }
      }
    
      const fetchDogs = async () => {
        try {
          const searchParams = new URLSearchParams({
            size: "20",
            from: ((currentPage - 1) * 20).toString(),
            sort: `breed:${sortOrder}`,
          })
    
          if (selectedBreed) {
            searchParams.append("breeds", selectedBreed)
          }
    
          const searchResponse = await fetch(`https://frontend-take-home-service.fetch.com/dogs/search?${searchParams}`, {
            credentials: "include",
          })
          const searchData: SearchResult = await searchResponse.json()
    
          const dogsResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(searchData.resultIds),
            credentials: "include",
          })
          const dogsData: Dog[] = await dogsResponse.json()
    
          setDogs(dogsData)
          setTotalPages(Math.ceil(searchData.total / 20))
        } catch (error) {
          console.error("Error fetching dogs:", error)
        }
      }
    
      const handleBreedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBreed(event.target.value)
        setCurrentPage(1)
      }
    
      const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(event.target.value as "asc" | "desc")
        setCurrentPage(1)
      }
    
      const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
      }
    
    
      return (
        <div className="dashboard">
                  <nav>
        <ul>
          {!isLoggedIn ? (
            <li>
              <a href="/">
                <button>Sign Up</button>
              </a>
            </li>
          ) : (
            <li>
              <button onClick={handleSubmit}>Logout</button>
            </li>
          )}
        </ul>
        {message && <p className="message">{message}</p>}
      </nav>

          <h1>Dog Adoption Dashboard</h1>
          <div className="filters">
            <select className="breed-select" value={selectedBreed} onChange={handleBreedChange}>
              <option value="">All Breeds</option>
              {breeds.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </select>
            <select className="sort-select" value={sortOrder} onChange={handleSortChange}>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
          <div className="dog-grid">
            {dogs.map((dog) => (
              <div key={dog.id} className="dog-card">
                <img
                  src={dog.img || "/placeholder.svg"}
                  alt={dog.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
                <h3>{dog.name}</h3>
                <p>Breed: {dog.breed}</p>
                <p>Age: {dog.age}</p>
                <p>Zip Code: {dog.zip_code}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              {currentPage} of {totalPages}
            </span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      )
    }
    
    export default Dashboard
  