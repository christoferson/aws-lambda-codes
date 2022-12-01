# aws-lambda-codes
Aws Lambda Codes

Requires layers with aws node modules

### DynamoDB

```
{
  "routeKey": "PUT /items",
  "body": "{\r\n\"id\": \"2\",\r\n\"price\": 22,\r\n\"name\": \"Eggs\"\r\n}"
}
```


```
{
  "routeKey": "GET /items/{id}",
  "pathParameters": {
    "id": "1"
  }
}
```


### NPM INIT PROJECT

npm init


### NPM AWS SDK

npm install aws-sdk

https://www.npmjs.com/package/aws-sdk


