var AWS = require('aws-sdk'),
  region = 'us-east-1',
  // secretName = 'prod/altery/hectacloud',
  secretName = 'altery/production/hectacloud',
  secret,
  decodedBinarySecret

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
  region: region,
  accessKeyId: 'AKIAV3YS7YLB25VGNF6R',
  secretAccessKey: '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',
})

module.exports = getCredentials = async () => {
  return await client
    .getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        if (err.code === 'DecryptionFailureException') throw err
        else if (err.code === 'InternalServiceErrorException') throw err
        else if (err.code === 'InvalidParameterException') throw err
        else if (err.code === 'InvalidRequestException') throw err
        else if (err.code === 'ResourceNotFoundException') throw err
      } else {
        if ('SecretString' in data) {
          secret = data.SecretString
        } else {
          let buff = new Buffer(data.SecretBinary, 'base64')
          decodedBinarySecret = buff.toString('ascii')
        }
      }
      return secret
    })
    .promise()
}
