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
        "tarife" : [{"pocetak" : "00:00:00", "kraj" : "24:00:00", "cijena" : 2.00}], 
        "lokacija" : {"idlokacije" : 1, "opislokacije" : "tržni/poslovni centar"}
    }, ... 
]
```

- csv format:
```csv:
idgaraza,imegaraza,ulica,broj,kvart,brojmjesta,brojrazina,maksimalnavisina,dostupnostpovlastenekarte,idtarifegaraze,cijena,pocetak,kraj,idlokacije,opislokacije
1,Importanne Centar,Trg Ante Starčevića,7,Donji Grad,450,2,2.4,t,1,2.00,00:00:00,24:00:00,1,tržni/poslovni centar

