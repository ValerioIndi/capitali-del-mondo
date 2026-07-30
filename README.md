# 🌍 Capitali del Mondo

Quiz sulle capitali di tutti gli stati del mondo. Viene mostrata una nazione (con la sua bandiera) e
devi scrivere la capitale. La grafia non deve essere perfetta: **piccoli errori di battitura e gli
accenti vengono perdonati**.

Realizzato con **React + Vite**, componenti **shadcn/ui** (Tailwind CSS), animazioni con
**Framer Motion**. Design mobile-first e responsive.

## Come si gioca

- Per ogni nazione scrivi la capitale nella casella.
- Se sbagli, ti vengono rivelate le lettere iniziali (fino a 2), poi la risposta corretta.
- Punteggio per domanda:
  - **3 punti** se rispondi subito
  - **2 punti** dopo la 1ª lettera rivelata
  - **1 punto** dopo le prime 2 lettere
  - **0 punti** se non indovini
- A fine partita vedi **punteggio / massimo** e il tuo record personale (salvato nel browser).

## Sviluppo in locale

```bash
npm install
npm run dev
```

Poi apri l'indirizzo indicato nel terminale (di solito `http://localhost:5173`).

Per provare la build di produzione:

```bash
npm run build
npm run preview
```

## Pubblicazione (GitHub Pages)

Il deploy è automatico tramite GitHub Actions: ad ogni `push` sul branch `main`, il workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila il progetto e pubblica la
cartella `dist/` su GitHub Pages.

**Passo da fare una sola volta** su GitHub:
`Settings → Pages → Build and deployment → Source: GitHub Actions`.

Sito online: <https://valerioindi.github.io/capitali-del-mondo/>

> Nota: in [`vite.config.js`](vite.config.js) l'opzione `base` è impostata a `/capitali-del-mondo/`
> perché il sito è servito da una sottocartella. Se rinomini il repository, aggiorna anche quel valore.

## Struttura

```
src/
├─ data/capitals.js     # elenco stati, capitali, bandiere, nomi alternativi
├─ utils/matching.js    # riconoscimento risposta tollerante ai typo (Levenshtein)
├─ utils/storage.js     # salvataggio record e storico (localStorage)
├─ components/          # schermate di gioco + componenti shadcn/ui
└─ App.jsx              # logica della partita
```
