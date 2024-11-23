document.addEventListener('DOMContentLoaded', function() {
    const listingsContainer = document.getElementById('listingsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const statusFilter = document.getElementById('statusFilter');
    let currentListings = [];

    // Function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Function to create listing card
    function createListingCard(listing) {
        const statusBadgeClass = {
            active: 'bg-success',
            pending: 'bg-warning',
            sold: 'bg-secondary'
        }[listing.status || 'active'];

        return `
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card listing-card">
                    <span class="badge ${statusBadgeClass} badge-status">${listing.status || 'Active'}</span>
                    <img src="http://localhost:3000${listing.imageUrl}" class="card-img-top" alt="${listing.itemName}">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-tag me-2"></i>${listing.itemName}
                        </h5>
                        <p class="card-text">${listing.itemDescription}</p>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="far fa-clock me-2"></i>Listed on ${formatDate(listing.createdAt)}
                            </small>
                        </p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-primary action-btn" onclick="editListing('${listing._id}')">
                                <i class="fas fa-edit me-2"></i>Edit
                            </button>
                            <button class="btn btn-outline-danger action-btn" onclick="showDeleteConfirmation('${listing._id}')">
                                <i class="fas fa-trash me-2"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to show loading state
    function showLoading() {
        loadingSpinner.style.display = 'flex';
        listingsContainer.style.display = 'none';
        emptyState.classList.add('d-none');
    }

    // Function to hide loading state
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        listingsContainer.style.display = 'block';
    }

    // Function to update stats
    function updateStats(listings) {
        document.getElementById('totalListings').textContent = listings.length;
        document.getElementById('activeListings').textContent = listings.filter(l => l.status !== 'sold').length;
        document.getElementById('totalViews').textContent = listings.reduce((sum, l) => sum + (l.views || 0), 0);
    }

    // Function to fetch and display listings
    async function fetchAndDisplayListings() {
        try {
            showLoading();
            const response = await fetch('http://localhost:3000/api/listings');
            const listings = await response.json();
            currentListings = listings;
            
            updateStats(listings);

            if (listings.length === 0) {
                emptyState.classList.remove('d-none');
                listingsContainer.innerHTML = '';
                return;
            }

            emptyState.classList.add('d-none');
            listingsContainer.innerHTML = listings.map(listing => createListingCard(listing)).join('');
        } catch (error) {
            console.error('Error fetching listings:', error);
            listingsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Error loading listings. Please try again later.
                    </div>
                </div>
            `;
        } finally {
            hideLoading();
        }
    }

    // Function to show delete confirmation
    window.showDeleteConfirmation = function(listingId) {
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        
        confirmDeleteBtn.onclick = async function() {
            await deleteListing(listingId);
            deleteModal.hide();
        };
        
        deleteModal.show();
    };

    // Function to delete a listing
    async function deleteListing(listingId) {
        try {
            const response = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            await fetchAndDisplayListings();
            showToast('Success', 'Listing deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting listing:', error);
            showToast('Error', 'Failed to delete listing. Please try again.', 'error');
        }
    }

    // Function to show toast notifications
    function showToast(title, message, type = 'info') {
        // Implement toast notification here
        alert(`${title}: ${message}`);
    }

    // Function to apply filters
    window.applyFilters = function() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;
        const status = statusFilter.value;

        let filteredListings = [...currentListings];

        // Apply search filter
        if (searchTerm) {
            filteredListings = filteredListings.filter(listing => 
                listing.itemName.toLowerCase().includes(searchTerm) ||
                listing.itemDescription.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (status !== 'all') {
            filteredListings = filteredListings.filter(listing => 
                listing.status === status
            );
        }

        // Apply sorting
        filteredListings.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'nameAsc':
                    return a.itemName.localeCompare(b.itemName);
                case 'nameDesc':
                    return b.itemName.localeCompare(a.itemName);
                default:
                    return 0;
            }
        });

        listingsContainer.innerHTML = filteredListings.map(listing => createListingCard(listing)).join('');
        
        if (filteredListings.length === 0) {
            emptyState.classList.remove('d-none');
        } else {
            emptyState.classList.add('d-none');
        }
    };

    // Add event listeners for search and filters
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Initial fetch of listings
    fetchAndDisplayListings();
}); 