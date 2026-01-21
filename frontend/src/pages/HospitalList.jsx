import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import Navbar from '../landing/components/Navbar';
import HospitalCard from '../components/HospitalCard';
import apiService from '../services/api';
import './HospitalList.css';

const HospitalList = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        state: '',
        specialization: ''
    });

    useEffect(() => {
        fetchHospitals();
    }, [filters]);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const response = await apiService.getPublicHospitals(filters);
            if (response.success) {
                setHospitals(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch hospitals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    return (
        <div className="hospital-list-page">
            <Navbar />

            {/* Hero Section */}
            <div className="list-hero">
                <div className="hero-content">
                    <h1>Find World-Class Care</h1>
                    <p>Browse our network of approved hospitals and transplant centers.</p>

                    <div className="search-bar">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by hospital name, city, or specialization..."
                            value={filters.search}
                            onChange={handleSearch}
                        />
                        <button className="search-btn">Search</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="list-container">
                {/* Filters Sidebar - Could be expandable */}
                <div className="list-header">
                    <h2>Verified Hospitals ({hospitals.length})</h2>
                    <div className="filter-tags">
                        {/* Minimal filter UI for now */}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card-skeleton"></div>
                        ))}
                    </div>
                ) : (
                    <div className="hospital-grid">
                        {hospitals.map(hospital => (
                            <HospitalCard key={hospital._id} hospital={hospital} />
                        ))}

                        {hospitals.length === 0 && (
                            <div className="no-results">
                                <h3>No hospitals found</h3>
                                <p>Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalList;
