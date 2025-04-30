const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Tasks';

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const task = {
        id: Date.now().toString(),
        task: body.task,
        deadline: body.deadline
    };

    await dynamo.put({ TableName: TABLE_NAME, Item: task }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Task saved successfully' })
    };
};