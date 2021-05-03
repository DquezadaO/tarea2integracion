const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const {
  serializedId,
  artistSerializer,
  albumSerializer,
  trackSerializer,
} = require('./commonFunctions');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

/* ARTISTS METHODS */

app.get('/api/artists', async (req, res) => {
  try {
    const client = await pool.connect();
    client.query('SELECT * FROM artists;').then(q => {
      const results = (q) ? q.rows : null;
      let response = [];
      results.forEach(r => response.push(artistSerializer(r)));
      res.status(200).json(response);
    });
  } catch (error) {
    return res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.get('/api/artists/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const client = await pool.connect();
    client.query('SELECT * FROM artists;').then(q => {
      const results = (q) ? q.rows : null;
      let artist = {};
      results.forEach(r => {
        if (r.id == artistId) {
          artist = r;
        };
      });
      if (artist == {}) {
        return res.status(404).send('Artist Not Found');
      };
      const response = artistSerializer(artist);
      res.status(200).json(response);
      client.release();
    });
  } catch (error) {
    return res.status(404).send('Artist Not Found');
  } finally {
    client.release();
  };
});

app.get('/api/artists/:artistId/albums', async (req, res) => {
  try {
    const { artistId } = req.params;
    const client = await pool.connect();
    client.query('SELECT * FROM artists;').then(q => {
      const results = (q) ? q.rows : null;
      let artist = {};
      results.forEach(r => {
        if (r.id == artistId) {
          artist = r;
        };
      });
      if (artist == {}) {
        return res.status(404).send('Artist Not Found');
      } else {
        client.query('SELECT * FROM albums;').then(q => {
          const results2 = (q) ? q.rows : null;
          let response = [];
          results2.forEach(r => {
            if (artistId == r.artist_id) {
              response.push(albumSerializer(r))
            };
          });
          res.status(200).json(response);
        });
      };
    });
  } catch (error) {
    return res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.get('/api/artists/:artistId/tracks', async (req, res) => {
  try {
    const { artistId } = req.params;
    const client = await pool.connect();
    client.query('SELECT * FROM artists;').then(q => {
      const results = (q) ? q.rows : null;
      let artist = {};
      results.forEach(r => {
        if (r.id == artistId) {
          artist = r;
        };
      });
      if (artist == {}) {
        return res.status(404).send('Artist Not Found');
      } else {
        client.query('SELECT * FROM albums').then(q => {
          const results2 = (q) ? q.rows : null;
          let albums = [];
          results2.forEach(r => {
            if (artist.id == r.artist_id) {
              albums.push(albumSerializer(r))
            };
          });
          client.query('SELECT * FROM tracks;').then(q => {
            const results3 = (q) ? q.rows : null;
            let response = [];
            results3.forEach(r => {
              albums.forEach(a => {
                if (r.album_id == a.id) {
                  response.push(trackSerializer(r));
                }
              });
            });
            res.status(200).json(albums);
          });
        });
      };
    });
  } catch (error) {
    return res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.post("/api/artists", async (req, res) => {
  try {
    const client = await pool.connect();
    const { name, age } = req.body;
    if (name == undefined || age == undefined || typeof age != "number") {
      return res.status(400).send('Invalid Input');
    }

    const id = serializedId(name);
    client.query('INSERT INTO artists VALUES($1, $2, $3) RETURNING *;', [id, name, age])
    .then(q => {
      const results = (q) ? q.rows : null;
      let artist = {};
      results.forEach(r => {
        if (r.id == id) {
          artist = r;
        };
      });
      const response = artistSerializer(artist);
      res.status(201).json(response);
    })
    .catch(e => {
      return res.status(409).json('Existing Artist');
    });
  } catch (error) {
    return res.status(409).json('Existing Artist');
  } finally {
    client.release();
  };
});

app.post("/api/artists/:artistId/albums", async (req, res) => {
  try {
    const client = await pool.connect();
    const { artistId } = req.params;
    const { name, genre } = req.body;
    if (!name || !genre) {
      res.status(400).send('Invalid Input');
      return;
    };
    
    const id = serializedId(`${name}:${artistId}`);
    client.query('INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING *;', [id, name, genre, artistId])
    .then(q => {
      const results = (q) ? q.rows : null;
      let album = {};
      results.forEach(r => {
        if (r.id == id) {
          album = r;
        };
      });
      const response = albumSerializer(album);
      res.status(201).json(response);
    })
    .catch(e => {
      return res.status(409).json('Existing Album');
    });
  } catch (error) {
    return res.status(422).send('Unexisting Artist');
  } finally {
    client.release();
  };
});

app.put("/api/artists/:artistId/albums/play", async (req, res) => {
  try {
    const { artistId } = req.params;
    const client = await pool.connect();
    client.query('SELECT * FROM artists;').then(q => {
      const results = (q) ? q.rows : null;
      let artist = {};
      results.forEach(r => {
        if (r.id == artistId) {
          artist = r;
        };
      });
      if (artist == {}) {
        return res.status(404).send('Artist Not Found');
      } else {
        client.query(
          'UPDATE tracks AS T SET times_played = T.times_played + 1 FROM albums AS A WHERE T.album_id = A.id AND A.artist_id = $1;',
          [artistId]
          ).then(q => {
            res.status(200).send('Songs From Artist (ID: ' + artistId + ') Played');
        });
      };
    });
  } catch (error) {
    return res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.delete("/api/artists/:artistId", async (req, res) => {
  try {
    const client = await pool.connect();
    const { artistId } = req.params;
    client.query('DELETE FROM artists WHERE id = $1;', [artistId]).then(q => {
      res.status(204).send('Artist Deleted');
    }).catch(e => {
      res.status(404).send('Unexisting Artist');
    });
  } catch (error) {
    res.status(404).send(error);
  } finally {
    client.release();
  };
});

/* ALBUMS METHODS */

app.get('/api/albums', async (req, res) => {
  try {
    const client = await pool.connect();
    client.query('SELECT * FROM albums;').then(q => {
      const results = (q) ? q.rows : null;
      let response = [];
      results.forEach(r => response.push(artistSerializer(r)));
      res.status(200).json(response);
      client.release();
    });
  } catch (error) {
    res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.get('/api/albums/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;
    const client = await pool.connect();
    client.query('SELECT * FROM albums;').then(q => {
      const results = (q) ? q.rows : null;
      let album = {};
      results.forEach(r => {
        if (r.id == albumId) {
          album = r;
        };
      });
      if (album == {}) {
        return res.status(404).send('Album Not Found');
      };
      const response = albumSerializer(album);
      res.status(200).json(response);
      client.release();
    });
  } catch (error) {
    return res.status(404).send('Album Not Found');
  } finally {
    client.release();
  };
});

app.get("/api/albums/:albumId/tracks", async (req, res) => {
  try {
    const client = await pool.connect();
    const { albumId } = req.params;
    client.query('SELECT * FROM albums;').then(q => {
      const results = (q) ? q.rows : null;
      let album = {};
      results.forEach(r => {
        if (r.id == albumId) {
          album = r;
        };
      });
      if (album == {}) {
        return res.status(404).send('Album Not Found');
      } else {
        client.query('SELECT * FROM tracks;').then(q => {
          const results2 = (q) ? q.rows : null;
          let response = [];
          results2.forEach(r => {
            if (albumId == r.album_id) {
              tracks.push(trackSerializer(r));
            };
          });
          res.status(200).json(response);
        });
      };
    });
  } catch (error) {
    return res.status(404).send(error.name);
  } finally {
    client.release();
  };
});

app.post("/api/albums/:albumId/tracks", async (req, res) => {
  try {
    const client = await pool.connect();
    const { albumId } = req.params;
    const { name, duration, times_played } = req.body;
    if (!name || !duration) {
      return res.status(400).send('Invalid Input');
    };
    const timesPlayed = times_played ? times_played : 0;
    const id = serializedId(`${name}:${albumId}`);
    client.query('SELECT * FROM albums;').then(q => {
      const results = (q) ? q.rows : null;
      let album = {};
      results.forEach(r => {
        if (r.id == albumId) {
          album = r;
        };
      });
      if (album == {}) {
        return res.status(422).send('Unexisting Album');
      } else {
        client.query('INSERT INTO tracks VALUES($1, $2, $3, $4, $5) RETURNING *;', [id, name, duration, times_played, albumId]).then(q => {
          const results2 = (q) ? q.rows : null;
          let track = {};
          results.forEach(r => {
            if (r.id == id) {
              track = r;
            };
          });
          const response = trackSerializer(track);
          res.status(201).json(response);
        }).catch(err => {
          return res.status(409).send('Existing Song');
        })
      };
    });
  } catch (error) {
    return res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.put("/api/albums/:albumId/tracks/play", async (req, res) => {
  try {
    const client = await pool.connect();
    const { albumId } = req.params;
    client.query('SELECT * FROM albums;').then(q => {
      const results = (q) ? q.rows : null;
      let album = {};
      results.forEach(r => {
        if (r.id == albumId) {
          album = r;
        };
      });
      if (album == {}) {
        return res.status(404).send('Album Not Found');
      } else {
        client.query(
          'UPDATE tracks AS T SET times_played = T.times_played + 1 WHERE T.album_id = $1;',
          [albumId]
          ).then(q => {
            res.status(200).send('Songs From Album (ID: ' + albumId + ') Played');
        });
      };
    });
  } catch (error) {
    res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.delete("/api/albums/:albumId", async (req, res) => {
  try {
    const client = await pool.connect();
    const { albumId } = req.params;
    client.query('DELETE FROM albums WHERE id = $1;', [albumId]).then(q => {
      res.status(204).send('Album Deleted');
    }).catch(e => {
      return res.status(404).send('Unexisting Album');
    })
  } catch (error) {
    res.status(404).send('Unexisting Album');
  } finally {
    client.release();
  };
});

/* TRACKS METHODS */

app.get('/api/tracks', async (req, res) => {
  const client = await pool.connect();
  const query = client.query('SELECT * FROM tracks').then(q => {
    const results = (q) ? q.rows : null;
    let response = [];
    results.forEach(r => response.push(trackSerializer(r)));
    res.status(200).json(response);
    client.release();
  });
});

app.get("/api/tracks/:trackId", async (req, res) => {
  const { trackId } = req.params;
  const client = await pool.connect();
  const query = client.query('SELECT * FROM tracks').then (q => {
    const results = (q) ? q.rows : null;
    let track = {};
    results.forEach(r => {
      if (r.id == trackId) {
        track = r;
      };
    });
    if (track == {}) {
      return res.status(404).send('Track Not Found');
    };
    const response = trackSerializer(track);
    res.status(200).json(response);
    client.release();
  });
});

app.put("/:trackId/play", async (req, res) => {
  try {
    const { trackId } = req.params;
    const client = await pool.connect();

    const query = client.query('SELECT * FROM tracks').then (q => {
      const results = (q) ? q.rows : null;
      let track = {};
      results.forEach(r => {
        if (r.id == trackId) {
          track = r;
        };
      });
      if (track == {}) {
        return res.status(404).send('Track Not Found');
      } else {
        client.query(
          'UPDATE tracks AS T SET times_played = T.times_played + 1 WHERE T.id = $1;',
          [trackId]
          ).then(q => {
            res.status(200).send('Track Played');
          });
        };
    });
  } catch (error) {
    res.status(404).send(error);
  } finally {
    client.release();
  };
});

app.delete("/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const client = await pool.connect();
    client.query('DELETE FROM tracks WHERE id = $1;', [trackId]).then(q => {
      res.status(204).send('Track Ereased');
    }).catch(e => {
      res.status(404).send('Unexisting Track');
    });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
