const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB,process.env.DB_USER,'', {
    host: "localhost",
    dialect: 'mysql'
  });

 sequelize.authenticate()
  .then(()=>{
      console.log("database connected")
  }).catch((err)=>{
       console.log("err"+err);
  })

module.exports = sequelize;
