document.addEventListener('DOMContentLoaded', function() {
    const itemImage = document.getElementById('itemImage');
    const imagePreview = document.getElementById('imagePreview');
    const listingForm = document.getElementById('listingForm');

    // console.log('Form elements:', {
    //     form: listingForm,
    //     image: itemImage,
    //     preview: imagePreview
    // });


    if (itemImage) {
        itemImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submission
    if (listingForm) {
        listingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get values directly from elements
            const name = document.getElementById('itemName').value.trim();
            const description = document.getElementById('itemDescription').value.trim();
            const imageFile = document.getElementById('itemImage').files[0];

            console.log('Form Values:', {
                name,
                description,
                imageFile
            });

            if (!name || !description || !imageFile) {
                alert('Please fill in all fields and select an image');
                return;
            }

            const formData = new FormData();
            formData.append('itemName', name);
            formData.append('itemDescription', description);
            formData.append('itemImage', imageFile);

            

            // Send the data
            fetch('http://localhost:3000/api/listings', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Listing created successfully!');
                

                const modal = bootstrap.Modal.getInstance(document.getElementById('listingModal'));
                modal.hide();

                listingForm.reset();
                imagePreview.style.display = 'none';

                fetchAndDisplayListings();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error creating listing: ' + error.message);
            });
        });
    }

    // Function to fetch and display listings
    async function fetchAndDisplayListings() {
        try {
            const response = await fetch('http://localhost:3000/api/listings');
            const listings = await response.json();
            console.log('Fetched listings:', listings);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    }

    // Initial fetch of listings
    fetchAndDisplayListings();
});
