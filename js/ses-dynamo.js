console.log("Loading event");

var aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ params: { TableName: "SESNotifications" } });

exports.handler = function (event, context, callback) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  var SnsPublishTime = event.Records[0].Sns.Timestamp;
  var SnsTopicArn = event.Records[0].Sns.TopicArn;
  var SESMessage = event.Records[0].Sns.Message;

  SESMessage = JSON.parse(SESMessage);
  console.log("SES Message: " + SESMessage);

  var SESMessageType = SESMessage.eventType; //SESMessage.notificationType;
  var SESMessageId = SESMessage.mail.messageId;
  var SESDestinationAddress = SESMessage.mail.destination.toString();
  var LambdaReceiveTime = new Date().toString();
  
  console.log("Got MessageType: " + SESMessageType);

  if (SESMessageType == "Bounce") {
    var SESreportingMTA = SESMessage.bounce.reportingMTA;
    var SESbounceSummary = JSON.stringify(SESMessage.bounce.bouncedRecipients);
    if (SESreportingMTA == null) {
        SESreportingMTA = "-";
    }
    var itemParams = {
      Item: {
        SESMessageId: { S: SESMessageId },
        SnsPublishTime: { S: SnsPublishTime },
        SESreportingMTA: { S: SESreportingMTA },
        SESDestinationAddress: { S: SESDestinationAddress },
        SESbounceSummary: { S: SESbounceSummary },
        SESMessageType: { S: SESMessageType },
      },
    };
    ddb.putItem(itemParams, function (err, data) {
      if (err) {
        callback(err)
      } else {
        console.log(data);
        callback(null,'')
      }
    });
  } else if (SESMessageType == "Delivery") {
    var SESsmtpResponse1 = SESMessage.delivery.smtpResponse;
    var SESreportingMTA1 = SESMessage.delivery.reportingMTA;
    var itemParamsdel = {
      Item: {
        SESMessageId: { S: SESMessageId },
        SnsPublishTime: { S: SnsPublishTime },
        SESsmtpResponse: { S: SESsmtpResponse1 },
        SESreportingMTA: { S: SESreportingMTA1 },
        SESDestinationAddress: { S: SESDestinationAddress },
        SESMessageType: { S: SESMessageType },
      },
    };
    ddb.putItem(itemParamsdel, function (err, data) {
      if (err) {
        callback(err)
      } else {
        console.log(data);
        callback(null,'')
      }
    });
  } else if (SESMessageType == "Complaint") {
    var SESComplaintFeedbackType = SESMessage.complaint.complaintFeedbackType;
    var SESFeedbackId = SESMessage.complaint.feedbackId;
    var itemParamscomp = {
      Item: {
        SESMessageId: { S: SESMessageId },
        SnsPublishTime: { S: SnsPublishTime },
        SESComplaintFeedbackType: { S: SESComplaintFeedbackType },
        SESFeedbackId: { S: SESFeedbackId },
        SESDestinationAddress: { S: SESDestinationAddress },
        SESMessageType: { S: SESMessageType },
      },
    };
    ddb.putItem(itemParamscomp, function (err, data) {
      if (err) {
        console.log("Error Saving Complaint: " + err);
        callback(err)
      } else {
        console.log("Success Saving Complaint: " + err);
        console.log(data);
        callback(null, '')
      }
    });
  } else {
      console.log("Unsupported Message Type: " + SESMessageType);
      callback("Unsupported Message Type", '200')
  }
};
