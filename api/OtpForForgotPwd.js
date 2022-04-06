const AWS = require('aws-sdk')
require('dotenv').config()
const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const getCredentials = require('./SecretManger')

const OtpForForgotPwd = async (req, res) => {
  try {
    const { username, password, code } = req.body

    var credentials = await getCredentials()

    if (credentials) {
      credentials = JSON.parse(credentials.SecretString)
    }

    const poolData = {
      UserPoolId: credentials.AWS_POOL_ID,
      ClientId: credentials.AWS_CLIENT_ID,
    }

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)

    var userData = {
      Username: username,
      Pool: userPool,
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

    cognitoUser.confirmPassword(code, password, {
      onFailure(err) {
        console.log('Error in otp for forgot password=>', err)
        res.status(500).send({
          success: false,
          message: 'Error in otp for forgot password!',
        })
      },
      onSuccess(data) {
        res.status(200).send({
          success: true,
          message: data,
        })
      },
    })
  } catch (error) {
    console.log('error in otp for the forgot password !', error)
    res.status(500).send({
      success: false,
      message: 'Error in otp for forgot password!',
    })
  }
}

module.exports = OtpForForgotPwd
