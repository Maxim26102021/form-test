let controller = new AbortController();

const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party",
    token = "22d71f6573e2e805991b3ea5c8b4fa34b5f8556c";

let query = null,
    response = null;


const searchFieldName = document.querySelector('#party'),
    resultContainer = document.querySelector('#results'),
    info = document.querySelector('.info'),
    shortNameField = info.querySelector('.row #name_short'),
    fullNameField = info.querySelector('.row #name_full'),
    innField = info.querySelector('.row #inn_kpp'),
    addressField = info.querySelector('.row #address');

let options = {
    signal: controller.signal,
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json",
        "Authorization": "Token " + token
    },
    body: JSON.stringify({query: query})
};

const fetchData = async (url, options, query) => {
    if(query) {
        options.body = JSON.stringify({query: query})
        return await fetch(url, options)
            .then(response => response.text())
            .then(result => JSON.parse(result))
            .catch(error => console.log("aborted prev", error));
    }
}


const fillFields = (item) => {
    searchFieldName.value = item.value;
    shortNameField.value = item.data.name.short_with_opf || 'нет';
    fullNameField.value = item.data.name.full_with_opf;
    innField.value = `${item.data.inn} / ${item.data.kpp}`;
    addressField.value = item.data.address.unrestricted_value;
}

const createResultRow = (el, id) => {
    return `<button id="${id}" class="search-item">
                <div class="search-item__top">
                    ${el.value}
                </div>
                <div class="search-item__bottom">
                    <div class="search-item__inn">${el.data.inn}</div>
                    <div class="search-item__address">${el.data.address.value}</div>
                </div>
            </button>`;
}

const selectItem = (e) => {
    let button = e.target.closest('button'),
        item = response[button.id];

    fillFields(item);

    resultContainer.classList.add('hidden');
    resultContainer.removeEventListener('click', selectItem);
}


const watchClick = () => {
    resultContainer.addEventListener('click', selectItem);
}


const searchByName = (selector) => {
    controller = new AbortController();
    const signal = controller.signal;
    options.signal = signal;

    query = selector.value;
    fetchData(url, options, query).then(data => {
        if(data !== undefined && data.suggestions.length !== 0) {
            resultContainer.classList.remove('hidden');
            resultContainer.classList.add('active');

            resultContainer.innerHTML = '';

            data.suggestions.forEach((el, i) => {
                resultContainer.insertAdjacentHTML('beforeend', createResultRow(el, i));
            })

            watchClick();
            response = data.suggestions;
        } else {
            resultContainer.classList.add('hidden');
            resultContainer.classList.remove('active');
            response = null;
        }
    })
}

const watchInput = (selector, cb) => {
    selector.addEventListener('input', () => {
        if(selector.value === '') {
            controller.abort();
            resultContainer.classList.add('hidden');
            resultContainer.classList.remove('active');
            return;
        }
        cb(selector);
    })
}

watchInput(searchFieldName, searchByName);

let doc = document.body;
doc.addEventListener('click', (e) => {
    resultContainer.classList.add('hidden');
    resultContainer.classList.remove('active');
})




