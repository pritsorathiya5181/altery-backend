const AWS = require('aws-sdk')
require('dotenv').config()
const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const getCredentials = require('./SecretManger')

const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body

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

    cognitoUser.forgotPassword({
      onSuccess: (ress) => {
        res.status(200).send({
          success: true,
          message: ress,
        })
      },
      onFailure: (err) => {
        console.log(err)
        res.status(500).send({
          success: false,
          message: 'Error in forgot password !!',
        })
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: 'Error in forgot password !!',
    })
  }
}
module.exports = forgotPassword
