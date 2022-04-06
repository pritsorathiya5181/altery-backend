const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const AWS = require('aws-sdk')
var CryptoJS = require('crypto-js')
require('dotenv').config()
const getCredentials = require('./SecretManger')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAV3YS7YLB25VGNF6R',
  secretAccessKey: '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',
})

const signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, mobileNo, password, citizen, gender } =
      req.body

    var credentials = await getCredentials()

    if (credentials) {
      credentials = JSON.parse(credentials.SecretString)
    }

    const poolForUser = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: credentials.AWS_POOL_ID,
      ClientId: credentials.AWS_CLIENT_ID,
      AdvancedSecurityDataCollectionFlag: false,
    })

    const cognito = new AWS.CognitoIdentityServiceProvider()

    let attributesForUserCreation = []
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'name',
        Value: firstname,
      })
    )
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'family_name',
        Value: lastname,
      })
    )
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    )
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'gender',
        Value: gender,
      })
    )
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'phone_number',
        Value: mobileNo,
      })
    )
    attributesForUserCreation.push(
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: 'custom:citizen',
        Value: citizen,
      })
    )

    const userAttributes = [...attributesForUserCreation]
    const username = email
    console.log('userAttributes => ', userAttributes)

    poolForUser.signUp(
      username,
      password,
      userAttributes,
      null,
      (err, result) => {
        if (err) {
          console.log('Error in creating the User !!', err)
          return res.status(500).send({
            success: false,
            message: 'Error in creating the User !!',
          })
        }
        console.log('Result is ', result)

        var snsParams = {
          Protocol: 'EMAIL' /* required */,
          TopicArn:
            'arn:aws:sns:us-east-1:403229885123:AlterySnsTopic' /* required */,
          Endpoint: email,
          ReturnSubscriptionArn: true,
        }

        var subscribePromise = new AWS.SNS({
          apiVersion: '2010-03-31',
          region: 'us-east-1',
        })
          .subscribe(snsParams)
          .promise()

        subscribePromise
          .then(function (data) {
            console.log('Subscription ARN is ' + data)

            var setSubParams = {
              AttributeName: 'FilterPolicy' /* required */,
              SubscriptionArn: data.SubscriptionArn /* required */,
              AttributeValue: '{ "email": [ "' + email + '" ] }',
            }

            var subscribePromiseAttri = new AWS.SNS({
              apiVersion: '2010-03-31',
              region: 'us-east-1',
            })
              .setSubscriptionAttributes(setSubParams)
              .promise()

            subscribePromiseAttri
              .then(function (data) {
                console.log('subscribePromiseAttri => ', data)
              })
              .catch(function (err) {
                console.error(err, err.stack)
              })
          })
          .catch(function (err) {
            console.error(err, err.stack)
          })

        res.status(200).send({
          success: true,
          ...result.user,
        })
      }
    )
  } catch (error) {
    console.log('error is ', error)
    res.status(500).send({
      success: false,
      message: 'Error in signUp',
    })
  }
}

module.exports = signUp
