# Stranica za pretragu garaža u Zagrebu

Ovaj repozitorij sadrži otvorene podatke o garažama u Zagrebu te web sučelje za dobivanje i filtraciju tih podataka. Podatci su dostupni u .csv i .json formatu te u obliku dumpa PostgreSQL baze podataka.

## Metapodatci

- **Licencija**: Creative Commons Zero v1.0 Universal
- **Autor**: Vedran Vrabec
- **Verzija**: 1.0
- **Jezik**: hrvatski
- **Datum izrade**: 27.10.2024.
- **Datum zadnje promjene**: 27.10.2024.
- **Formati podataka**: JSON, CSV, dump SQL
- **Kontakt**: <vedran.vrabec@fer.unizg.hr>
- **Ključne riječi**: Zagreb, garaža, parking
- **Područje**: Zagreb, Hrvatska
- **Podrška**: Ako imate bilokakvih pitanja, prijedloga ili uočenih grešaka, javite mi se na email koji je naveden u kontaktima.

## Opis atributa

- **idgaraza** (integer): Jedinstveni identifikator garaže
- **imegaraza** (string): Ime garaže
- **ulica** (string): Ulica u kojoj se nalazi ulaz garaže
- **broj** (integer): Kućni broj ulice u kojoj se garaža nalazi
- **kvart** (string): Kvart u kojem se garaža nalazi
- **brojmjesta** (integer): Ukupan broj parkirnih mjesta u garaži
- **brojrazina** (integer): Broj razina u garaži
- **maksimalnavisina** (float): Maksimalna visina vozila koja može ući u garažu (u metrima)
- **dostupnostpovlastenekarte** (boolean): Informacija o dostupnosti povlaštenih karata
- **tarife**: Cijena karte u razdobljima određenim s početak i kraj
  - **pocetak** (time): Vrijeme početka određene tarife
  - **kraj** (time): Vrijeme određene završetka tarife
  - **cijena** (float): Cijena parkiranja za određeni vremenski period
- **lokacija**: Informacija o lokaciji garaže, odnosno u sklopu čega se nalazi garaža
  - **idlokacije** (integer): Jedinstveni identifikator lokacije
  - **opislokacije** (string): Opis lokacije (npr. tržni/poslovni centar, javna garaža, bolnička garaža)

> Napomena: U PostgreSQL-u korišten je tip `TIME` za definiranje atributa `pocetak` i `kraj`, što se u JSON i CSV formatu prikazuje kao HH:MM:SS (sati, minute i sekunde). Također, u bazi podataka je zapisivanje `maksimalnaVisina` korišteno `DECIMAL(3, 1)`, za `cijena` je korišteno `DECIMAL(5, 2)`, za sve atribute tipa string `VARCHAR(50)` osim za `broj` gdje je korišteno `VARCHAR(10)`.
