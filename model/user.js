const Sequelize = require('sequelize')
const sequelize = require("../config/dbconn")
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
      id:{
          type:Sequelize.INTEGER,
           autoIncrement:true,
           primaryKey:true
       },
      firstname:{
          type: Sequelize.STRING
        },
      lastname:{
          type: Sequelize.STRING
       },
      email:{
          type: Sequelize.STRING
        },
      password :{
          type: Sequelize.STRING
        },
      userImage :{
          type:Sequelize.STRING
        }
      },{
          timestamps : true
      });  
    //  User.sync();
      User.beforeCreate(async (user, options) => {
        try {
          const hash = await bcrypt.hash(user.password, 10);
          user.password = hash;
        } catch (err) {
           console.log(err)
        }
    });

module.exports = User