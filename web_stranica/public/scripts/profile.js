document.addEventListener('DOMContentLoaded', function() {
    fetch('/user').then(response => response.json()).then(user => {
        const detailsDiv = document.getElementById('detalji');
        detailsDiv.innerHTML = `<h2>Korisnički profil</h2>
                                <p><strong>Ime:</strong> ${user.name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Sub:</strong> ${user.sub}</p>`;
        console.log(user);
    });
});