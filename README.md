
# 🧠 Smart To-Do List with Email Reminders (AWS Free Tier)

A fully serverless cloud-based to-do list application that allows users to:
- ✅ Add tasks with deadlines.
- 📧 Receive automatic email reminders 15 minutes before a task is due.
- 🌐 Host the frontend via S3 and integrate with API Gateway and Lambda.
- 💸 Built using only AWS Free Tier services.

---

## 📦 Tech Stack

| Component      | AWS Service         | Resource Name         |
|----------------|---------------------|------------------------|
| Database       | DynamoDB            | `Tasks`               |
| Task Storage   | Lambda              | `SaveTaskFunction`    |
| Email Reminder | Lambda              | `ReminderFunction`    |
| API Gateway    | HTTP API            | Linked to SaveTaskFunction |
| Frontend       | Amazon S3 (Static Website) | `smart-todo-avin`   |
| Email Sender   | Amazon SES          | Verified Identity     |
| Scheduler      | CloudWatch Events   | `rate(5 minutes)`     |

---

## 🚀 Getting Started

### Prerequisites

- An [AWS Account](https://aws.amazon.com/free)
- A verified email in [Amazon SES](https://console.aws.amazon.com/ses/)
- Basic knowledge of JavaScript/HTML

---

## 🛠️ Step-by-Step Setup

### 1. Create DynamoDB Table

- Name: `Tasks`
- Partition key: `id` (String)

---

### 2. Create Lambda: `SaveTaskFunction`

- Runtime: **Node.js 18.x**
- Code:

```js
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

    await dynamo.put({
        TableName: TABLE_NAME,
        Item: task
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Task saved successfully" })
    };
};
```

- Permissions:
  - `AmazonDynamoDBFullAccess`

---

### 3. Setup API Gateway

- Type: **HTTP API**
- Integration: `SaveTaskFunction`
- Copy the **Invoke URL** for frontend usage

---

### 4. Create Frontend (`index.html`)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Smart To-Do List</title>
</head>
<body>
    <h1>Smart To-Do List</h1>
    <form id="taskForm">
        <input type="text" id="task" placeholder="Enter Task" required>
        <input type="datetime-local" id="deadline" required>
        <button type="submit">Add Task</button>
    </form>
    <script>
        const apiUrl = 'https://your-api-id.execute-api.region.amazonaws.com'; // Replace with your API endpoint

        document.getElementById('taskForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const task = document.getElementById('task').value;
            const deadline = document.getElementById('deadline').value;

            await fetch(apiUrl + '/task', {
                method: 'POST',
                body: JSON.stringify({ task, deadline }),
                headers: { 'Content-Type': 'application/json' }
            });

            alert('Task added!');
        });
    </script>
</body>
</html>
```

- Host on S3 bucket named `smart-todo-avin`
- Enable **Static Website Hosting**
- Make the bucket **public** and allow read access

---

### 5. Verify SES Email

- Go to SES → Verified Identities
- Verify `your-email@example.com`
- Click email link to complete verification

---

### 6. Create Reminder Lambda: `ReminderFunction`

```js
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: 'us-east-1' });
const TABLE_NAME = 'Tasks';
const EMAIL = 'your-email@example.com'; // Replace with your verified email

exports.handler = async () => {
    const now = new Date();
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000);

    const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    const tasks = result.Items || [];

    const upcomingTasks = tasks.filter(task => {
        const taskTime = new Date(task.deadline);
        return taskTime > now && taskTime <= in15Min;
    });

    for (const task of upcomingTasks) {
        await ses.sendEmail({
            Source: EMAIL,
            Destination: { ToAddresses: [EMAIL] },
            Message: {
                Subject: { Data: `Reminder: ${task.task}` },
                Body: {
                    Text: { Data: `Your task "${task.task}" is due by ${task.deadline}.` }
                }
            }
        }).promise();
    }

    return { statusCode: 200, body: 'Reminders sent.' };
};
```

- Permissions:
  - `AmazonDynamoDBReadOnlyAccess`
  - `AmazonSESFullAccess`

---

### 7. Schedule Reminder with CloudWatch

- Go to CloudWatch → Rules → Create Rule
- Source: `Schedule expression`
- Value: `rate(5 minutes)`
- Target: `ReminderFunction`

---

## ✅ Testing Instructions

1. Open your S3-hosted frontend.
2. Add a task with a deadline **15–20 minutes ahead**.
3. Wait ~5–10 minutes.
4. Check your email inbox for the reminder.

### Notes:
- Make sure SES is in **sandbox mode** unless you request production access.
- Only **verified emails** can receive reminders in sandbox mode.

---

## 🧪 Manual Lambda Test

To test the reminder logic manually:

- Go to Lambda → `ReminderFunction`
- Click **Test**
- Select "Hello World" template, or leave event blank.
- Click **Test** again to trigger reminder logic.
- Check logs in **CloudWatch Logs** if no email is received.

---

## 📄 License

This project is free to use under the MIT License.

---

## 💡 Ideas for Improvement

- Add user authentication (Cognito)
- Add task editing/deletion features
- Store user emails and send task-specific notifications

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📬 Contact

Avin Dabre  
📧 Email: avindabre16@gmail.com  
🌍 Project URL: [Hosted S3 Website](http://bucket10405cc.s3-website-us-east-1.amazonaws.com/))  
