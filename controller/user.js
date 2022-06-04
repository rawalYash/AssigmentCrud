const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.adduser = async (req, res, next) => {
  const path = "http://localhost:8000/uploads/user/";
  const { firstname, lastname, email, password, status, message } = validation(req.body);

  if (status !== 200) {
    return res.status(status).send({
      message: message,
      status: status,
    });
  }
  let user = await User.findOne({ where: { email: email } });
  if (user) {
    return res.status(400).send({
      message: "User already exists",
      status: 400,
    });
  }
  const userdata = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    userImage: path+req.file.filename
  };
  user = await User.create(userdata);
  return res.send({
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      userImage: user.userImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    message: "success",
    status: 200,
  });
};

exports.findalluser = async (req, res) => {
  try {
    const user = await User.findAll();
    return res.send({
      user,
    });
  } catch (err) {
    return res.status(400).send({
      message: "DataBase is empty",
    });
  }
};

exports.findbyid = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id: id } });
    if (user) {
      return res.send({
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: "success",
        status: 200,
      });
    }
    return res.status(400).send({
      message: "user not found",
    });
  } catch (err) {
    return res.status(400).send({
      message: "user not found",
    });
  }
};

exports.updateuser = async (req, res) => {
  try {
    const id = req.params.id;
    const userdata = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    };

    const existUser = await User.findOne({where : {email : userdata.email}})
    if(existUser){
      return res.send({
        err : "this email is already presnet"
      })
    }
    
    await User.update(userdata, { where: { id: id } });
    const user = await User.findOne({ where: { id: id } });

    return res.send({
      message: "User Updated",
      user,
    });
  } catch (err) {
    return res.status(400).send({
      message: "something went wrong",
    });
  }
};

exports.deleteuser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id: id } });
    await User.destroy({ where: { id: id } });
    if (user)
      return res.send({
        message: "User has been deleted",
        user,
      });
    return res.status(400).send({
      message: "user not found",
    });
  } catch (err) {
    return res.status(400).send({
      message: "Something went wrong",
      err
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    res.status(400).send("All input is required");
  }
  const user = await User.findOne({ where: { email } });
  if (user && (await bcrypt.compare(password, user.password))) {
    const responseUser = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };
    const token = jwt.sign(responseUser, process.env.SECRETE_KEY, {
      expiresIn: "1h",
    });

    res.send({
      user: responseUser,
      accessToken: token,
    });
  } else {
    res.status(400).send({
      message: "invalid cradentials",
    });
  }
};

exports.changePassword = async (req, res) => {
  let user = req.user;
  if (!user) {
    return res.status(400).send({
      message: "user Does not found",
      status: 400,
    });
  }
  let user1 = await User.findOne({ where: { email: user.email } });
  // console.log(user1)
  const { oldPassword, newPassword } = req.body;
  if (!(oldPassword && newPassword)) {
    return res.status(400).send({
      message: "all input require",
      status: 400,
    });
  }
  const checkpass = await bcrypt.compare(oldPassword, user1.password);
  if (checkpass) {
    user1.password = bcrypt.hashSync(newPassword, 8);
    user1.save();
    return res.send({
      message: "userPassword updated",
    });
  }
  return res.status(400).send({
    message: "Old password does not match",
    status: 400,
  });
};

exports.fileupload = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "please insert a file",
      status: 400,
    });
  }
  return res.json({
    message: "file inserted succesfully",
    file,
  });
};

exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).send({
      message: "User is not registerd",
      status: 400,
    });
  }
  // console.log(user)
  const responseUser = {
    id: user.user_id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  };
  const token = jwt.sign(responseUser, process.env.SECRETE_KEY, {
    expiresIn: "1h",
  });

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASS,
    },
  });
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Password reset link",
    text: `http://localhost:8000/users/resetpassword/${token}`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      return res.status(400).send({
        message: err,
        status: 400,
      });
    }
    return res.send({
      message: `password reset link has been sent to your email address ${mailOptions.to}`,
    });
  });
};

exports.resetPassword = async (req, res) => {
  try{
    let user = req.user;
    if (!user) {
      return res.status(400).send({
        message: "User not found",
        status: 400,
      });
    }
    let user1 = await User.findOne({ where: { email: user.email } });
    const { newpassword, confirmpassword } = req.body;
    if (!(newpassword && confirmpassword)) {
      return res.status(400).send({
        message: "all input require",
        status: 400,
      });
    }
    if (!(newpassword === confirmpassword)) {
      return res.status(400).send({
        message: "new password does not match with confirmpassword",
        status: 400,
      });
    }
    user1.password = bcrypt.hashSync(newpassword, 8);
    user1.save();
    return res.send({
      message: "userPassword updated",
    });

  }catch(err){
    res.status(400).send({
      err:"something went wrong"
    })
  }
};

function validation(body) {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!body || Object.keys(body).length === 0) {
    return {
      message: "Invalid Payload",
      status: 400,
    };
  }

  if (!body.firstname || body.firstname.trim() === "") {
    return {
      message: "missing firstname",
      status: 400,
    };
  }

  if (!body.lastname || body.lastname.trim() === "") {
    return {
      message: "missing lastname",
      status: 400,
    };
  }

  if (!body.email || body.email.trim() === "") {
    return {
      message: "missing email",
      status: 400,
    };
  }

  if (!emailRegex.test(body.email)) {
    return {
      message: "Invalid email address",
      status: 400,
    };
  }

  if (!body.password || body.password.trim() === "") {
    return {
      message: "missing password",
      status: 400,
    };
  }

  return {
    firstname: body.firstname.trim(),
    lastname: body.lastname.trim(),
    email: body.email.trim(),
    password: body.password.trim(),
    status: 200,
    message: "success",
  };
}
