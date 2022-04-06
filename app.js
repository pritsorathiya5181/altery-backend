const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
const {
  SIGNIN,
  SIGNUP,
  CONFIRMSIGNUP,
  FORGOTPWD,
  OTPFORFORGOTPWD,
  UPDATEUSER,
} = require('./routes')
const signIn = require('./api/SignIn.js')
const signUp = require('./api/SignUp.js')
const ConfirmSignUp = require('./api/ConfirmSignUp')
const ForgotPassword = require('./api/ForgotPassword')
const OtpForForgotPwd = require('./api/OtpForForgotPwd')

const port = process.env.PORT || 5055

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post(SIGNIN, signIn)
app.post(SIGNUP, signUp)
app.post(CONFIRMSIGNUP, ConfirmSignUp)
app.post(FORGOTPWD, ForgotPassword)
app.post(OTPFORFORGOTPWD, OtpForForgotPwd)

app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
})
