module.exports = (sequelize, type) => {
    return sequelize.define('track', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: type.STRING,
        duration: type.FLOAT,
        times_played: type.INTEGER,
    })
}