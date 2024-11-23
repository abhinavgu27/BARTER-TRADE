document.addEventListener('DOMContentLoaded', function () {
    const listingsContainer = document.getElementById('listingsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
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

    // Function to fetch and display listings for the current user
    async function fetchUserListings() {
        try {
            showLoading();
            // Fetch user-specific listings
            const response = await fetch('http://localhost:3000/api/listings'); // Adjust endpoint as necessary
            const listings = await response.json();
            currentListings = listings;

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
                        Error loading your listings. Please try again later.
                    </div>
                </div>
            `;
        } finally {
            hideLoading();
        }
    }



    // Fetch user-specific listings on load
    fetchUserListings();
});
