// Obtenido de: https://www.codementor.io/@mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

const Sequelize = require('sequelize')
const ArtistModel = require('./models/artist')
const AlbumModel = require('./models/album')
const TrackModel = require('./models/track')

const sequelize = new Sequelize('codementor', 'root', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const Artist = ArtistModel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const Album = AlbumModel(sequelize, Sequelize)
const Track = TrackModel(sequelize, Sequelize)

Track.belongsTo(Album);
Album.belongsTo(Artist);

sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  Artist,
  Album,
  Track
}