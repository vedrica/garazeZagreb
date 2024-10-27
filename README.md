# Otvoreni podatci o garažama u Zagrebu
Ovaj repozitorij sadrži otvorene podatke o garažama u Zagrebu. Podatci su dostupni u .csv i .json formatu te u obliku dumpa PostgreSQL baze podataka.

## Metapodatci
- **Licencija**: Creative Commons Zero v1.0 Universal
- **Autor**: Vedran Vrabec
- **Verzija**: 1.0
- **Jezik**: hrvatski
- **Datum izrade**: 28.10.2024.
- **Datum zadnje promjene**: 28.10.2024. 
- **Formati podataka**: JSON, CSV, dump SQL
- **Kontakt**: vedran.vrabec@fer.unizg.hr
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



## Primjer podataka
- JSON format:
```json:
[
    {
        "idgaraza" : 1, 
        "imegaraza" : "Importanne Centar", 
        "ulica" : "Trg Ante Starčevića", 
        "broj" : "7",
        "kvart" : "Donji Grad", 
        "brojmjesta" : 450, 
        "brojrazina" : 2, 
        "maksimalnavisina" : 2.4, 
        "dostupnostpovlastenekarte" : true, 
        "tarife" :
                [{
                    "pocetak" : "00:00:00",
                    "kraj" : "24:00:00",
                    "cijena" : 2.00
                }], 
        "lokacija" : {
                        "idlokacije" : 1,
                        "opislokacije" : "tržni/poslovni centar"
                    }
    }, ... 
]
```

- CSV format:
```csv:
idgaraza,imegaraza,ulica,broj,kvart,brojmjesta,brojrazina,maksimalnavisina,dostupnostpovlastenekarte,idtarifegaraze,cijena,pocetak,kraj,idlokacije,opislokacije
1,Importanne Centar,Trg Ante Starčevića,7,Donji Grad,450,2,2.4,t,1,2.00,00:00:00,24:00:00,1,tržni/poslovni centar

