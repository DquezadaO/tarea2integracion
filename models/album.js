module.exports = (sequelize, type) => {
    return sequelize.define('album', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: type.STRING,
        genre: type.STRING,
    })
}