const AWS = require('aws-sdk');

var http = require("http");

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Hello SNS - starting\n');
   createPlatformEndpoint()
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

const buildAPSPayloadString = (message) => {
    return JSON.stringify({
       aps: {
        alert: message,
      }
    });
  };
  const buildFCMPayloadString = (message) => {
    return JSON.stringify({
      notification: {
        text: message
      }
    }) 
  };


const createPlatformEndpoint = (platform, deviceId, token) => {  
  const snsClient = Promise.promisifyAll(new AWS.SNS({
    region: config.region,
    apiVersion: config.apiVersion
  }));
  let applicationArn = '';
  if (paramaters.platform === 'ios') {
    applicationArn = config.iosPlatformApplicationARN;
  } else if (paramaters.platform === 'android') {
    applicationArn = config.andPlatformApplicationARN;
  }
  let snsParams = {    
    Token: deviceToken,
    PlatformApplicationArn: applicationArn,
    CustomUserData: deviceId
  };
  return snsClient.createPlatformEndpointAsync(snsParams);
};

const publish = (endpoint, platform, message) => {
    let payloadKey, payload = '';
    if (platform === 'ios') {
      payloadKey = 'APNS';
      payload = buildAPSPayloadString(message);
    } 
    else if (platform === 'android') {
      payloadKey = 'GCM';
      payload = buildFCMPayloadString(message);
    }
    const snsClient = Promise.promisifyAll(new AWS.SNS({
      region: config.region,
      apiVersion: config.apiVersion
    }));
    let snsMessage = {};
    snsMessage[payloadKey] = payload;
    
    let snsParams = {
      Message: JSON.stringify(snsMessage),
      TargetArn: endpoint,
      MessageStructure: 'json'
    };
    return snsClient.publishAsync(snsParams)
  };