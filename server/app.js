const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(cors());
app.use(express.static(path.join(__dirname,'..','public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/api/data', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          glumac.ime,
          glumac.prezime,
          glumac.dob,
          glumac.datumrodenja,
          glumac.zemljarodenja,
          glumac.visina,
          glumac.bojaociju,
          glumac.brojosvojenihoscara,
          glumac.networth,
          filmserija.naslov AS naslovfilmaserije
        FROM
          glumac
          JOIN glumiu ON glumac.glumacid = glumiu.glumacid
          JOIN filmserija ON glumiu.filmserijaid = filmserija.filmserijaid
      `);
  
      const data = result.rows;
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  app.post('/api/add', async (req, res) => {
    //const client = await db.connect();
  
    try {
      await db.query('BEGIN');
  
      const { ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth, naslov } = req.body;
  
      if (!ime || !prezime || !dob || !datumrodenja || !zemljarodenja || !visina || !bojaociju || !brojosvojenihoscara || !networth || !naslov) {
        res.json({ message: 'Svi atributi moraju biti dostavljeni.' });
        return res.status(400).json({ error: 'Svi atributi moraju biti dostavljeni.' });

      }
  
      // Provjeri postoji li glumac s istim imenom i prezimenom
      const existingActor = await db.query('SELECT * FROM glumac WHERE ime = $1 AND prezime = $2', [ime, prezime]);
  
      if (existingActor.rows.length > 0) {
        // Glumac već postoji, vrati grešku
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Glumac već postoji.' });
      }
  
      // Glumac ne postoji, dodaj ga
      const newActor = await db.query(
        'INSERT INTO glumac (ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING glumacid',
        [ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth]
      );
  
      // Provjeri postoji li film ili serija s istim naslovom
      const existingMedia = await db.query('SELECT * FROM filmserija WHERE naslov = $1', [naslov]);
  
      let mediaId;
  
      if (existingMedia.rows.length > 0) {
        // Film ili serija već postoji
        mediaId = existingMedia.rows[0].filmserijaid;
      } else {
        // Film ili serija ne postoji, dodaj ga
        const newMedia = await db.query('INSERT INTO filmserija (naslov) VALUES ($1) RETURNING filmserijaid', [naslov]);
        mediaId = newMedia.rows[0].filmserijaid;
      }
  
      // Poveži glumca s filmom ili serijom
      await db.query('INSERT INTO glumiu (glumacid, filmserijaid) VALUES ($1, $2)', [newActor.rows[0].glumacid, mediaId]);
  
      await db.query('COMMIT');
  
      res.json({ message: 'Uspješno dodano!' });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      //client.release();
    }
  });


  app.put('/api/update', async (req, res) => {
    try {
      const { ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth, naslov } = req.body;

      if ((!ime || !prezime) || (!dob && !datumrodenja && !zemljarodenja && !visina && !bojaociju && !brojosvojenihoscara && !networth && !naslov)) {
        res.json({ message: 'Ime i prezime mora biti upisano i barem jedan dodatni atribut.' });
        return res.status(400).json({ error: 'Ime i prezime mora biti upisano i barem jedan dodatni atribut.' });

      }
  
      // Provjerite postoji li glumac s istim imenom i prezimenom
      const existingActor = await db.query('SELECT * FROM glumac WHERE ime = $1 AND prezime = $2', [ime, prezime]);
  
      if (existingActor.rows.length === 0) {
        return res.status(404).json({ error: 'Glumac nije pronađen.' });
      }
  
      await db.query('BEGIN');
  
      // Ažuriranje podataka
      const updatedActor = await db.query(
        'UPDATE glumac SET dob = $1, datumrodenja = $2, zemljarodenja = $3, visina = $4, bojaociju = $5, brojosvojenihoscara = $6, networth = $7 WHERE ime = $8 AND prezime = $9 RETURNING *',
        [dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth, ime, prezime]
      );
  
      // Provjera i dodavanje naslova filma/serije
      if (naslov) {
        const existingMedia = await db.query('SELECT * FROM filmserija WHERE naslov = $1', [naslov]);
  
        let mediaId;
  
        if (existingMedia.rows.length > 0) {
          // Film ili serija već postoji
          mediaId = existingMedia.rows[0].filmserijaid;
        } else {
          // Film ili serija ne postoji, dodaj ga
          const newMedia = await db.query('INSERT INTO filmserija (naslov) VALUES ($1) RETURNING filmserijaid', [naslov]);
          mediaId = newMedia.rows[0].filmserijaid;
        }
  
        // Poveži glumca s filmom ili serijom
        await db.query('INSERT INTO glumiu (glumacid, filmserijaid) VALUES ($1, $2)', [updatedActor.rows[0].glumacid, mediaId]);
      }
  
      await db.query('COMMIT');
  
      res.json({ message: 'Uspješno ažurirano!' });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  

  app.delete('/api/delete', async (req, res) => {
    try {
      const { ime, prezime } = req.body;
  
      // Provjerite postoji li glumac s istim imenom i prezimenom
      const existingActor = await db.query('SELECT * FROM glumac WHERE ime = $1 AND prezime = $2', [ime, prezime]);
  
      if (existingActor.rows.length === 0) {
        return res.status(404).json({ error: 'Glumac nije pronađen.' });
      }
  
      await db.query('BEGIN');
  
      // Izbriši povezanost glumca s filmom/serijom
      await db.query('DELETE FROM glumiu WHERE glumacid = $1', [existingActor.rows[0].glumacid]);
  
      // Izbriši glumca
      await db.query('DELETE FROM glumac WHERE glumacid = $1', [existingActor.rows[0].glumacid]);
  
      await db.query('COMMIT');
  
      res.json({ message: 'Uspješno izbrisano!' });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
