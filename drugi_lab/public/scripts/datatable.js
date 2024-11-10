function showresults(data){
    const resultsDiv = document.getElementById('results');
    results.innerHTML = '<p id="rezultati">Rezultati pretrage:</p>';
    data.forEach(item => {
        Object.values(item).forEach(key => {
            console.log(key);
        });
    });
    if (data.length > 0) {
        console.log("Usao u if");
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        // Create table headers
        var headers = ['ID Garaže', 'Ime Garaže', 'Ulica', 'Broj', 'Kvart', 'Broj mjesta', 'Broj razina', 'Maksimalna visina', 'Dostupnost Povlaštene Karte', 'Početak', 'Kraj',  'Cijena', 'ID lokacije', 'Opis Lokacije'];
        var tr = document.createElement('tr');
        for(var header of headers){
            var th = document.createElement('th');
            th.textContent = header;
            tr.appendChild(th);
        };
        thead.appendChild(tr);
        table.appendChild(thead);

        data.forEach(item => {
            var tr = document.createElement('tr');
            Object.values(item).forEach(value => {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        resultsDiv.appendChild(table);
    } else {
        resultsDiv.innerHTML = '<p id="rezultati">Nema rezultata.</p>';
    }
}

fetch('/search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        search: '',
        sort: 'wildcard'
    })
}).then(response => { 
    if(!response.ok){
        return response.json().then(data => {
            throw new Error(data.error);
        });
    }  
    return response.json();
}).then(data => {
    showresults(data);
}).catch(error=> {
    console.error('Error fetching search results:', error)
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p id="rezultati">Došlo je do pogreške prilikom pretrage u bazi.</p>';
});

document.getElementById('searchForm').addEventListener('input', function(event) {
    event.preventDefault();

    const searchValue = document.getElementsByName('search')[0].value;
    const sortValue = document.getElementsByName('sort')[0].value;
    console.log("searchValue: " + searchValue + " sortValue: " + sortValue);
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search: searchValue,
            sort: sortValue
        })
    })
    .then(response => { 
        if(!response.ok){
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }  
        return response.json();
    }).then(data => {
        showresults(data);
    })
    .catch(error=> {
        console.error('Error fetching search results:', error)
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '<p id="rezultati">Došlo je do pogreške prilikom pretrage u bazi.</p>';
    });
});

window.onload = function() {
    document.querySelector('select[name="sort"]').value = 'wildcard';
    document.querySelector('input[name="search"]').value = '';
};

document.getElementById('getCSV').addEventListener('click', function(event) {
    const searchValue = document.getElementsByName('search')[0].value;
    const sortValue = document.getElementsByName('sort')[0].value;
    console.log("searchValue: " + searchValue + " sortValue: " + sortValue);
    fetch('/search/getCSV', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search: searchValue,
            sort: sortValue
        })
    })
    .then(response => {
        if(!response.ok){
            return response.json().then(data => {
                throw new Error(data.error);
            }
        );
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'garazeZagreb.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error fetching search results:', error);
    });
});

document.getElementById('getJSON').addEventListener('click', function(event) {
    const searchValue = document.getElementsByName('search')[0].value;
    const sortValue = document.getElementsByName('sort')[0].value;
    console.log("searchValue: " + searchValue + " sortValue: " + sortValue);
    fetch('/search/getJSON', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search: searchValue,
            sort: sortValue
        })
    })
    .then(response => {
        if(!response.ok){
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'garazeZagreb.json';
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error fetching search results:', error);
    });
});