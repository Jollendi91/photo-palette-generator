const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";
const pageNumber = 1;

function getSearchResults(searchText, callback) {
    const settings = {
        data: {
           client_id: '8f38787e053192449fa982baa9609a354ef6e12dafc55c7d1166c486d77017a3', 
           query: searchText,
           per_page: 30,
           page: 1
        },
        dataType: 'json',
        success: callback,
    }

    $.ajax(UNSPLASH_SEARCH_URL, settings);

}

function renderPhoto(photo) {
    const photoUrl = photo.urls.small;
    const userName = photo.user.name;

    return `
        <div class="photo-container">
          <img src="${photoUrl}" alt="A photo by ${userName}">
        </div>
    `
}

function renderSearchResults(data) {
    console.log(data);
    const results= data.results.map((photo, index) => renderPhoto(photo));
    $('#search-results').html(results);
}


function listenForPhotoSearchClick() {
    //this listens for a click on the photo search form
    $('#photo-search-form').submit(event => {
    event.preventDefault();
    console.log("Search form was submitted");
    let searchTerm = $('#search-input').val();
    $('#search-input').val('');
    console.log(searchTerm);
    getSearchResults(searchTerm, renderSearchResults);
    });
}

function getColorPalette(imageUrl) {
    //this makes a call to the color extractor api and returns a set of colors in the photo
    const imageToBeExtracted = {
        url: 'https://api.imagga.com/v1/colors',
        "async": true,
        "crossDomain": true,
        data: {
            url: imageUrl
        },
        "method": "GET",
        "headers": {
            "Authorization": "Basic YWNjX2QxMmYyN2E4ZjU3MTFmNzoxZjdiYjViZWE5OGNkYjVkYWM0MGQyNGI0ODQ4OGIyYg==",
            "Cache-Control": "no-cache",
          },
        success: generateColorPalette
    }

   $.ajax(imageToBeExtracted);
}

function generateColorPalette(er, data) {
    console.log(data);
    console.log(er);
}

function listenForPhotoSelect() {
    //this listens for a click on a search result photo
    $('#search-results').on('click','img', event => {
        const imageUrl = $('img').attr('src');
        getColorPalette(imageUrl);
    });
}

function callListeners() {
    listenForPhotoSearchClick();
  //  listenForPhotoSelect();
}

$(callListeners);