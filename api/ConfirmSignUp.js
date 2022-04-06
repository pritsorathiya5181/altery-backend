const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const AWS = require('aws-sdk')
require('dotenv').config()
const getCredentials = require('./SecretManger')

module.exports = ConfirmSignup = async (req, res) => {
  try {
    const { username, code } = req.body
    console.log(username, code)

    var credentials = await getCredentials()

    if (credentials) {
      credentials = JSON.parse(credentials.SecretString)
    }

    const poolData = {
      UserPoolId: credentials.AWS_POOL_ID,
      ClientId: credentials.AWS_CLIENT_ID,
    }

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)

    var userData = {
      Username: username,
      Pool: userPool,
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

    cognitoUser.confirmRegistration(code, true, (err, ress) => {
      if (err) {
        return res.status(500).send({
          message: 'Error in confirm signup !!!',
          success: false,
        })
      }
      return res.status(200).send({
        message: ress,
        success: true,
      })
    })
  } catch (error) {
    return res.status(500).send({
      message: 'Error in confirm signup !!!',
      success: false,
    })
  }
}
