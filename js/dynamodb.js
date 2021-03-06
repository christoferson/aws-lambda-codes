const AWS = require('aws-sdk');
const dynamoclient = new AWS.DynamoDB.DocumentClient();

const dynamo_table = "Character2";

async function list() {
  
  const params = {
    TableName : dynamo_table
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
    TableName: dynamo_table,
    KeyConditionExpression: '#region = :region',
    ExpressionAttributeNames: { '#region' : 'Region' },
    ExpressionAttributeValues: { ':region' : region }
  };
  
  params = {
    TableName: 'Character',
    KeyConditionExpression: '#region = :region and CharacterName = :name',
    ExpressionAttributeNames: { '#region' : 'Region' },
    ExpressionAttributeValues: { ':region' : region, ':name' : 'Name1' }
  }
  
  // Local Secondary Index
  params = {
    TableName: dynamo_table,
    IndexName: 'region-profession',
    KeyConditionExpression: '#region = :region AND Profession = :profession',
    ExpressionAttributeNames: { '#region' : 'Region' },
    ExpressionAttributeValues: { ':region' : region, ':profession' : 'Hunter' }
  };

  // Local Secondary Index
  params = {
    TableName: dynamo_table,
    IndexName: 'region-race',
    KeyConditionExpression: '#region = :region AND Race = :race',
    ExpressionAttributeNames: { '#region' : 'Region' },
    ExpressionAttributeValues: { ':region' : region, ':race' : 'Human' }
  };  

  try {
    
    const callback = function(err, data) {
      if (err) {
        console.log(err);
      } else {
       data.Items.forEach(function(character, index) {
           console.log("   * " + character.CharacterName);
        });
      }
    };
    
    const characters = await dynamoclient.query(params, callback).promise();
    return characters;

  } catch (err) {
    return err;
  }

}

async function register(region, name, race, profession) {

  const params = {
    TableName : dynamo_table,
    Item: {
      Region: region,
      CharacterName: name,
      Race: race,
      Profession: profession
    },
    ConditionExpression : 'attribute_not_exists(CharacterName)'
  };
  
  try {
    await dynamoclient.put(params).promise();
    console.log('Registered ' + JSON.stringify(params.Item));
  } catch (err) {
    console.log('Register Failed: ' + err);
    return err;
  }

}

async function retrieve(region, name) {

  const params = {
    TableName : dynamo_table,
    Key: {
      Region: region,
      CharacterName: name
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


async function editSet(region, name, race, profession) {
  
  const params = {
    TableName: dynamo_table,
    Key: {
      Region: region,
      CharacterName: name
    },
    ExpressionAttributeNames: {
        '#Race': 'Race',
        '#Profession': 'Profession'
    },
    ExpressionAttributeValues: {
        ':race': race,
        ':profession': profession
    },
    UpdateExpression: 'SET #Race = :race, #Profession = :profession',
    ConditionExpression : 'attribute_exists(CharacterName)'
  };

  try {
    await dynamoclient.update(params).promise();
    console.log('Updated ' + JSON.stringify(params.Key));
  } catch (err) {
    console.log('EditSet Failed: ' + err);
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
      console.log("Query-Result: " + JSON.stringify(characters));
    } else if (event.type == 'edit-set') {
      await editSet(event.region, event.name, event.race, event.profession);
    } else {
        console.log('Unknown Command: ' + event.type);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Processed ' + event.type + '!'),
    };
    return response;
};
