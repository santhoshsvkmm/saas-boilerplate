<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strix ERP - README</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">

<h1 style="color: #333;">Strix ERP</h1>

<h2 style="color: #333;">Overview</h2>
<p>Strix ERP is a Node.js module designed for enterprise resource planning (ERP) applications. It provides a robust platform for managing business processes, offering features like authentication, security, rate limiting, email sending, job scheduling, logging, data validation, and more.</p>

<h2 style="color: #333;">Features</h2>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li><strong>ERP:</strong> Comprehensive ERP functionalities for business management.</li>
  <li><strong>Security:</strong> Implements security best practices using Helmet and JWT authentication.</li>
  <li><strong>Rate Limiting:</strong> Protects against excessive requests with express-rate-limit and Redis.</li>
  <li><strong>Email Sending:</strong> Integrated email capabilities using Nodemailer.</li>
  <li><strong>Job Scheduling:</strong> Scheduled tasks with node-cron.</li>
  <li><strong>Logging:</strong> Advanced logging using Winston.</li>
  <li><strong>Data Validation:</strong> Ensures data integrity using Joi and Yup.</li>
  <li><strong>File Upload:</strong> Supports file uploads with Multer.</li>
</ul>

<h2 style="color: #333;">Getting Started</h2>

<h3 style="color: #333;">Prerequisites</h3>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li>Node.js</li>
  <li>npm (Node Package Manager)</li>
  <li>MySQL database</li>
</ul>

<h3 style="color: #333;">Installation</h3>
<ol style="margin-left: 20px;">
  <li>Clone the repository:
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>git clone &lt;repository-url&gt;</code></pre>
  </li>
  <li>Navigate to the project directory:
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>cd strix-erp</code></pre>
  </li>
  <li>Install server-side dependencies:
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>npm install</code></pre>
  </li>
  <li>Install client-side dependencies:
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>npm run client-install</code></pre>
  </li>
</ol>

<h3 style="color: #333;">Running the Application</h3>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li><strong>Start the Server:</strong>
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>npm run server</code></pre>
  </li>
  <li><strong>Start the Client:</strong>
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>npm run client</code></pre>
  </li>
  <li><strong>Development Mode:</strong>
    Run both server and client concurrently:
    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code>npm run dev</code></pre>
  </li>
</ul>

<h3 style="color: #333;">Configuration</h3>
<p>Create a <code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">.env</code> file in the root directory and configure your environment variables for database connection, JWT secret, etc.</p>

<h2 style="color: #333;">Scripts</h2>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li><code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">client-install</code>: Installs client-side dependencies.</li>
  <li><code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">start</code>: Starts the application using the <code>node</code> command.</li>
  <li><code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">server</code>: Starts the server with <code>nodemon</code> for automatic restarts.</li>
  <li><code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">client</code>: Starts the client-side application.</li>
  <li><code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px;">dev</code>: Runs both server and client concurrently for development.</li>
</ul>

<h2 style="color: #333;">Technologies Used</h2>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li><strong>Express:</strong> Fast, unopinionated, minimalist web framework for Node.js.</li>
  <li><strong>Sequelize:</strong> Promise-based Node.js ORM for MySQL.</li>
  <li><strong>JWT:</strong> JSON Web Token for secure authentication.</li>
  <li><strong>Nodemailer:</strong> Easy-to-use library for sending emails.</li>
  <li><strong>Node-cron:</strong> Cron for Node.js.</li>
  <li><strong>Winston:</strong> Versatile logging library.</li>
  <li><strong>Joi and Yup:</strong> Data validation libraries.</li>
</ul>

<h2 style="color: #333;">License</h2>
<p>This project is licensed under the ISC License.</p>

<h2 style="color: #333;">Author</h2>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li><strong>Santhosh Sivakumar</strong></li>
  <li>Contact: <a href="mailto:santhoshsivakumar077@gmail.com">santhoshsivakumar077@gmail.com</a></li>
</ul>
<p>For any questions or collaboration, feel free to contact me.</p>

</body>
</html>
