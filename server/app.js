const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

//sesija
app.use(session({
  secret: 'tajnikljucor',
  resave: true,
  saveUninitialized: true
}));

// Passport
passport.use(new Auth0Strategy({
  domain: 'dev-odzspckd5m1tpynq.eu.auth0.com',
  clientID: 'XTFMsXlixM9qvOtczxeBgyrnkMB2CGUM',
  clientSecret: 'tVVkEFP4lGfVP5ZBeNIjWoe8OU9yTlqcvEBxjJsLun0vHlF4UG7OgQ8hgntKG3G7',
  callbackURL: 'http://localhost:3000/callback',
  logoutURL: 'http://localhost:3000/logout' 
}, (accessToken, refreshToken, extraParams, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});



function generateCsvDataFromQueryResult(queryResult) {
  const csvHeader = Object.keys(queryResult[0]).join(',');
  const csvRows = queryResult.map(row => Object.values(row).join(','));
  const csvData = [csvHeader, ...csvRows].join('\n');
  return csvData;
}




app.use(passport.initialize());
app.use(passport.session());


app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    // Ako je korisnik već prijavljen, preusmjeri ga na početnu stranicu
    return res.redirect('/');
  }

  // Ako korisnik nije prijavljen, izvrši prijavu putem Auth0
  passport.authenticate('auth0', { scope: 'openid email profile' })(req, res);
  isAuthenticated = true;
});


//app.get('/callback',
//  passport.authenticate('auth0', { failureRedirect: '/' }),
//  (req, res) => {
//    res.redirect('/');
//  });
  app.get('/callback',
    passport.authenticate('auth0', { failureRedirect: '/' }),
    (req, res) => {
      // Ako korisnik nije prijavljen, prikaži gumb za prijavu
      if (!req.isAuthenticated()) {
        return res.redirect('/');
      }
      // Ako je korisnik prijavljen, prikaži gumbove za korisnički profil, osvježavanje preslika i odjavu
      res.send(`
        <p>Dobrodošli!</p>
        <a href="/user-profile">Korisnički profil</a>
        <a href="/refresh-exports">Osvježi preslike</a>
        <a href="/logout">Odjava</a>
        
      `);
    });


  app.get('/user-profile', (req, res) => {
   /*  console.log('Request received for /user-profile');
    if (req.isAuthenticated()) {
      console.log('User is authenticated');
      const userProfile = req.user;
      res.render('user-profile', { user: userProfile });
    } else {
      console.log('User is not authenticated, redirecting to /');
      res.redirect('/');
    } */
    console.log('Request received for /user-profile');
    if (!req.isAuthenticated()) {
      // Ako korisnik nije prijavljen, preusmjeri ga na početnu stranicu
      console.log('User is not authenticated, redirecting to /');
      return res.redirect('/');
    }
  
    //const userEmail = req.user.email;
    const userEmail = req.user.emails && req.user.emails.length > 0 ? req.user.emails[0].value : 'Nema dostupne e-mail adrese';
    //const userName = req.user.displayName;
    // Ako je korisnik prijavljen, izvrši osvježavanje preslika
    console.log('User is authenticated');
    console.log(req.user);
    //const userProfile = req.user;
    //res.render('user-profile', { user: userProfile });
    res.send(`
      <h2>Vaši podatci:</h2>
      <p>Email: ${userEmail}</p>
      <a href="/">Natrag na početnu</a>
    `);
  });
  

 /*  app.get('/refresh-exports', (req, res) => {
    if (!req.isAuthenticated()) {
      // Ako korisnik nije prijavljen, preusmjeri ga na početnu stranicu
      return res.redirect('/');
    }
    // Ako je korisnik prijavljen, izvrši osvježavanje preslika
    res.send(`
      <p>Osvježavanje preslika uspješno izvršeno!</p>
      <a href="/">Natrag na početnu</a>
    `);
  }); */
app.get('/refresh-exports', async (req, res) => {
  const isAuthenticated = req.isAuthenticated();

  if (isAuthenticated) {
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

      // Generiraj CSV podatke
      const csvData = generateCsvDataFromQueryResult(result);

      // Generiraj JSON podatke
      const jsonData = JSON.stringify(result, null, 2);

      // Postavi odgovarajuće zaglavlje za CSV
      res.header('Content-Type', 'text/csv');
      res.attachment('data.csv');
      // Pošalji CSV podatke kao odgovor
      res.write(csvData);

      // Postavi odgovarajuće zaglavlje za JSON
      res.header('Content-Type', 'application/json');
      res.attachment('data.json');
      // Pošalji JSON podatke kao odgovor
      res.end(jsonData);
    } catch (error) {
      console.error('Error during database query:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    // Ako korisnik nije autentificiran, vrati odgovarajući status
    res.status(401).send('Unauthorized');
  }
});

  
//app.get('/logout', (req, res) => {
//  req.logout();
//  res.redirect('/');
//});
/* app.get('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    // Ako korisnik nije prijavljen, preusmjeri ga na početnu stranicu
    return res.redirect('/');
  }

  // Ako je korisnik prijavljen, odjavi ga
  //req.logout();
  //res.redirect('/');
  req.logout();
  res.redirect('/');
}); */
app.get('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    // Ako korisnik nije prijavljen, vrati poruku
    return res.status(200).json({ message: 'Korisnik nije prijavljen.' });
  }

  isAuthenticated = false;
  // Ako je korisnik prijavljen, odjavi ga
  req.logout((err) => {
    if (err) {
      console.error('Greška tijekom odjave:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    return res.status(200).json({ message: 'Uspješna odjava.' });
  });
});

// Provjerite korisnikovo stanje
//app.get('/', (req, res) => {
//  if (!req.isAuthenticated()) {
//    return res.redirect('/login');
//  }

  //korisnik je prijavljen
//  res.send('Dobrodošli!');
//});
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // Ako je korisnik prijavljen, prikaži gumbove za korisnički profil, osvježavanje preslika i odjavu
    return res.send(`
      <p>Dobrodošli!</p>
      <a href="/user-profile">Korisnički profil</a>
      <a href="/refresh-exports">Osvježi preslike</a>
      <a href="/logout">Odjava</a>
    `);
  }
  // Ako korisnik nije prijavljen, prikaži gumb za prijavu
  res.send('<a href="/login">Prijava</a>');
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


app.get('/api/get/:glumacid', async (req, res) => {
  try {
    const { glumacid } = req.params;

    // Provjeri postoji li glumac s navedenim glumacid
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
      WHERE
        glumac.glumacid = $1
    `, [glumacid]);

    if (result.rows.length === 0) {
      // Ako glumac nije pronađen, vrati odgovarajuću poruku
      return res.status(404).json({ error: 'Glumac nije pronađen.' });
    }

    const data = result.rows[0];
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/add', async (req, res) => {
  try {
    await db.query('BEGIN');

    const { ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth, naslov } = req.body;

    if (!ime || !prezime || !dob || !datumrodenja || !zemljarodenja || !visina || !bojaociju || !brojosvojenihoscara || !networth || !naslov) {
      res.json({ message: 'Svi atributi moraju biti dostavljeni.' });
      return res.status(402).json({ error: 'Svi atributi moraju biti dostavljeni.' });
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
