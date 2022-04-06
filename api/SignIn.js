const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
require('dotenv').config()
const getCredentials = require('./SecretManger')

module.exports = signIn = async (req, res) => {
  try {
    const { username, password } = req.body

    var credentials = await getCredentials()

    if (credentials) {
      credentials = JSON.parse(credentials.SecretString)
    }

    const poolData = {
      UserPoolId: credentials.AWS_POOL_ID,
      ClientId: credentials.AWS_CLIENT_ID,
    }

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      {
        Username: username,
        Password: password,
      }
    )

    var userData = {
      Username: username,
      Pool: userPool,
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        console.log('access token + ' + result.getAccessToken().getJwtToken())
        console.log('id token + ' + result.getIdToken().getJwtToken())
        console.log('refresh token + ' + result.getRefreshToken().getToken())
        res.status(200).send(result)
      },
      onFailure: function (err) {
        console.log(err)
        res.status(500).send({
          message: 'Unable to signin user',
          success: false,
        })
      },
    })
  } catch (error) {
    console.log('error is ', error)
    res.status(500).send('Error in SignIn')
  }
}
