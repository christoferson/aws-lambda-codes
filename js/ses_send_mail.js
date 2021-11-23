/* Example Request
{
  "body": {
        "senderName": "Conan",
        "senderEmail": "xxx@zzz.com",
        "message": "Hi"
    }
}
*/

const aws = require("aws-sdk");
const ses = new aws.SES({ region: "us-east-1" });
exports.handler = async function (event) {
  console.log('EVENT: ', event)
  const { senderEmail, senderName, message } = JSON.parse(event.body)
  const params = {
    Destination: {
      ToAddresses: ["myemail@xxx.com"],
    },
    Message: {
      Body: {
        Text: { 
            Data: `${senderName} - ${senderEmail} sent message:
            ${message}` 
        },
      },
      Subject: { Data: `Message from ${senderName}` },
    },
    Source: "myemail@xxx.com",
  };

  return ses.sendEmail(params).promise();

};