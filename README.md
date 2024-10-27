# Otvoreni podatci o garažama u Zagrebu
Ovaj repozitorij sadrži otvorene podatke o garažama u Zagrebu. Podatci su dostupni u .csv i .json formatu te u obliku dumpa PostgreSQL baze podataka.

## Metapodatci
- **Licencija**: Creative Commons Zero v1.0 Universal
- **Autor**: Vedran Vrabec
- **Verzija**: 1.0
- **Jezik**: hrvatski
- **Datum kreiranja**: 27.10.2024.
- **Formati podataka**: JSON, CSV, dump SQL
- **Kontakt**: vedran.vrabec@fer.unizg.hr
-  

## Opis atributa
- **idgaraza**: Jedinstveni identifikator garaže
- **imegaraza**: Ime garaže
- **ulica**: Ulica u kojoj se nalazi ulaz garaže
- **broj**: Kućni broj ulice u kojoj se garaža nalazi
- **kvart**: Kvart u kojem se garaža nalazi
- **brojmjesta**: Ukupan broj parkirnih mjesta u garaži
- **brojrazina**: Broj razina u garaži
- **maksimalnavisina**: Maksimalna visina vozila koja može ući u garažu (u metrima)
- **dostupnostpovlastenekarte**: Informacija o dostupnosti povlaštenih karata (true/false)
- **tarife**: Cijena karte u razdobljima određenim s početak i kraj
  - **pocetak**: Vrijeme početka određene tarife 
  - **kraj**: Vrijeme određene završetka tarife
  - **cijena**: Cijena parkiranja za određeni vremenski period
- **lokacija**: Informacija o lokaciji garaže, odnosno u sklopu čega se nalazi garaža
  - **idlokacije**: Jedinstveni identifikator lokacije
  - **opislokacije**: Opis lokacije (npr. tržni/poslovni centar, javna garaža, bolnička garaža)

## Primjer podataka
- json format:
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

- csv format:
```csv:
idgaraza,imegaraza,ulica,broj,kvart,brojmjesta,brojrazina,maksimalnavisina,dostupnostpovlastenekarte,idtarifegaraze,cijena,pocetak,kraj,idlokacije,opislokacije
1,Importanne Centar,Trg Ante Starčevića,7,Donji Grad,450,2,2.4,t,1,2.00,00:00:00,24:00:00,1,tržni/poslovni centar

