const AWS = require('aws-sdk');
const dynamoclient= new AWS.DynamoDB.DocumentClient();


async function list() {
  
  const params = {
    TableName : 'Character'
  };
  
  try {
    const data = await dynamoclient.scan(params).promise();
    return data;
  } catch (err) {
    return err;
  }
  
}

async function query(region) {

  var params = {
    TableName: 'Character',
    //IndexName: 'Region',
    KeyConditionExpression: '#name = :value',
    ExpressionAttributeNames: { '#name': 'Region' },
    ExpressionAttributeValues: { ':value': region }
  }

  try {
    const data = await dynamoclient.query(params).promise()
    return data
  } catch (err) {
    return err
  }

}

async function register(region, name, race, profession) {

  const params = {
    TableName : 'Character',
    Item: {
      Region: region,
      Name: name,
      Race: race,
      Profession: profession
    }
  };
  
  try {
    await dynamoclient.put(params).promise();
    console.log('Inserted ' + JSON.stringify(params.Item));
  } catch (err) {
    return err;
  }

}

async function retrieve(region, name) {

  const params = {
    TableName : 'Character',
    Key: {
      Region: region,
      Name: name
    }
  };
  
  try {
    const character = await dynamoclient.get(params).promise();
    console.log('Retrieved: ' + JSON.stringify(character));
    return character;
  } catch (err) {
    console.log('Retrieved Failed: ' + err);
    return err;
  }

}


exports.handler = async (event) => {
    console.log(event);
    if (event.type == 'register') {
      await register(event.region, event.name, event.race, event.profession);
    } else if (event.type == 'retrieve') {
      const character = await retrieve(event.region, event.name);
      console.log(JSON.stringify(character));
    } else if (event.type == 'list') {
      const characters = await list();
      console.log(JSON.stringify(characters));
    } else if (event.type == 'query') {
      const characters = await query(event.region);
      console.log(JSON.stringify(characters));
    } else {
        console.log('Unknown Command: ' + event.type);
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hi from the ' + event.routeKey + ' route!'),
    };
    return response;
};
