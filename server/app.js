const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'..','public')));

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
  

app.post('/api/filter', async (req, res) => {
  const { attribute, value } = req.body;
  const query = {
    text: `SELECT ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth FROM glumac WHERE ${attribute} = $1`,
    values: [value],
  };

  try {
    const result = await db.query(query);
    const data = result.rows;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
