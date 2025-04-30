const AWS = require('aws-sdk');
const ses = new AWS.SES();
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Tasks';
const EMAIL = 'YOUR_VERIFIED_EMAIL';

exports.handler = async () => {
    const now = new Date();
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000);

    const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    const upcomingTasks = result.Items.filter(task => {
        const taskTime = new Date(task.deadline);
        return taskTime <= in15Min && taskTime >= now;
    });

    for (const task of upcomingTasks) {
        await ses.sendEmail({
            Destination: { ToAddresses: [EMAIL] },
            Message: {
                Body: { Text: { Data: `Reminder: ${task.task} is due soon!` } },
                Subject: { Data: 'To-Do Reminder' }
            },
            Source: EMAIL
        }).promise();
    }

    return { statusCode: 200, body: 'Reminders sent' };
};