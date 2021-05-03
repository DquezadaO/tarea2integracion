module.exports = (sequelize, type) => {
    return sequelize.define('artist', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: type.STRING,
        age: type.INTEGER,
    })
}