const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";
let pageNumber = 1;

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
    const unsplashUserLink = photo.user.links.html;
    const unsplashLink = photo.links.html;

    return `
        <div class="photo-container">
          <img src="${photoUrl}" data-username="${userName}" data-unsplash-user="${unsplashUserLink}" data-unsplash="${unsplashLink}" alt="A photo by ${userName}">
          <div class="button-container">
          </div>
        </div>
    `
}

function parseLinkHeader(header) {
    const parts = header.split(',');
    const links = {};

    parts.forEach(function (part) {
        let section = part.split(';');
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
    })

    return links;
}

function renderSearchResults(data, status, jqXHR) {
    const pageLinks = jqXHR.getResponseHeader('Link');
    const results = data.results.map((photo, index) => renderPhoto(photo));
    $('#search-results').html(results);

    links = parseLinkHeader(pageLinks);

    $('#page-buttons').html('');

    if (links.prev) {
        $('#page-buttons').append(`<button id="prev">Previous</button>`);
    }

    if (links.next) {
        $('#page-buttons').append(`<button id="next">Next</button>`);
    }
}

function listenForPaginationClick() {
    const settings = {
        success: renderSearchResults
    }

    $('#page-buttons').on('click', '#prev', event => {
        $.ajax(links.prev, settings);
    });

    $('#page-buttons').on('click', '#next', event => {
        $.ajax(links.next, settings);
    });
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

function renderPhotoButtons(selectedImg) {
    const userName = $(selectedImg).attr('data-username');
    const unsplashUserLink = $(selectedImg).attr('data-unsplash-user');
    $('.button-container').html('');
    $(selectedImg).parent('.photo-container').children('.button-container').html(`
    <div class="target-photo-buttons">
        <p>Photo by <a  href="${unsplashUserLink}?utm_source=photo_palette&utm_medium=referral" target="_blank">${userName}</a> on <a href="https://unsplash.com/?utm_source=photo_palette&utm_medium=referral" target="_blank">Unsplash</a></p>
        <button class="button generate-palette">Generate Color Palette</button>
    </div>
    `)
}

function listenForPhotoSelect() {
    //this listens for a click on a search result photo
    $('#search-results').on('click', 'img', event => {
        const selectedImg = event.currentTarget;
        console.log(selectedImg);
        const imageUrl = $(selectedImg).attr('src');
       // getColorPalette(imageUrl);
       renderPhotoButtons(selectedImg);
    });
}

function renderColor(color) {
    const colorRed = color.r;
    const colorGreen = color.g;
    const colorBlue = color.b;
    const colorHex = color.html_code;
    const colorId = colorHex.replace(/\#/g, '');

   

    $(`#${colorId}`).css('background-color', `${colorHex}`);
} 

function createColorContainer(color) {
    const colorId = color.html_code.replace(/\#/g, '');
    return `
    <div class="color" id="${colorId}">
    </div>
    `;
}

function generateBackgroundColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette background-color">
                <h2 class="palette-header">Background Colors</h2>
            </div>
        `);
        colors.map((color, index) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.background-color').append(`
                <div class="color" id="${colorId}">
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateForegroundColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette foreground-color">
                <h2 class="palette-header">Foreground Colors</h2>
            </div>
        `);
        colors.map((color, index) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.foreground-color').append(`
                <div class="color" id="${colorId}">
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateImageColors(colors) {
    if (colors.length !== 0) {
        $('.color-palette-container').append(`
            <div class="palette image-color">
                <h2 class="palette-header">Image Colors</h2>
            </div>
        `);
        colors.map((color, index) => {
            const colorId = color.html_code.replace(/\#/g, '');
            $('.image-color').append(`
                <div class="color" id="${colorId}">
                </div>
            `);
            renderColor(color);
        });
    }
}

function generateColorPalette(photo) {
    console.log(photo);
    const photoColors = photo.results[0].info;
    const backgroundColors = photoColors.background_colors;
    const imageColors = photoColors.image_colors;
    const foregroundColors = photoColors.foreground_colors;
    const photoImage = photo.results[0].image;

    $('.target-image-container').empty();
    $('.target-image-container').append(`
        <img src="${photoImage}">
    `);

    $('.color-palette-container').empty();
    generateBackgroundColors(backgroundColors);
    generateForegroundColors(foregroundColors);
    generateImageColors(imageColors);
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

function listenGenColorPalette() {
    $('#search-results').on('click','.generate-palette', event => {
        const imgUrl= $(event.currentTarget).closest('.photo-container').children('img').attr('src');
        getColorPalette(imgUrl);
        $('#color-palette').css('height', '100vh');
        $('html, body').animate({
            scrollTop: ($('#color-palette').offset().top)
        },500);
    });
}

function callListeners() {
    listenForPhotoSearchClick();
    listenForPhotoSelect();
    listenForPaginationClick();
    listenGenColorPalette();
}

$(callListeners);