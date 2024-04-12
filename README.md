<!DOCTYPE html>
<html>
<head>
  <title>Human Resource Management System</title>
</head>
<body>
  <h1 style="text-align: center;">
    <a href="#" style="text-decoration: none; color: black;" target="_blank" rel="noreferrer">Human Resource Management System</a> ℹ️
  </h1>
  <h4 style="text-align: center;">A powerful HRMS built with React, Node.Js, Express, MySQL...</h4>

  <h2>Description</h2>
  <p>
    This Human Resource Management System was made using 
    <a href="https://github.com/facebook/react#react-----" target="_blank">React</a> amongst other libraries on the frontend and 
    <a href="https://nodejs.org/en/" target="_blank">Node.js</a> as well as 
    <a href="https://expressjs.com/" target="_blank">Express</a> on the backend. 
    As for the database, I used 
    <a href="https://www.mysql.com/" target="_blank">MySQL</a> and 
    <a href="https://sequelize.org/" target="_blank">Sequelize</a> as the ORM.
  </p>

  <h3>Features</h3>
  <ul>
    <li>User authentication and authorization with <a href="https://www.npmjs.com/package/jsonwebtoken" target="_blank">jsonwebtoken</a> and personally developed <a href="https://github.com/vasilismantz/thesis-fullstack/blob/master/client/src/withAuth.js" target="_blank">authentication middleware hoc</a></li>
    <li>User Password encryption using hashing with <a href="https://www.npmjs.com/package/bcryptjs" target="_blank">bcrypt.js</a></li>
    <li>Responsive design and use of <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a></li>
    <li>Ability to Manage, Add, Update, Delete:
      <ul>
        <li>Users (Admin, Manager, Employee)</li>
        <li>Departments</li>
        <li>Job positions</li>
        <li>Applications (leave of absence...)</li>
        <li>Payroll Management:
          <ul>
            <li>Salary details per Employee</li>
            <li>Record payment history</li>
          </ul>
        </li>
        <li>Expense Management:
          <ul>
            <li>Add expenses</li>
            <li>View summary of expenses</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Storage of environmental variables with <a href="https://www.npmjs.com/package/dotenv" target="_blank">dotenv</a></li>
  </ul>

  <h2>Disclaimer</h2>

  <h2>User Manual</h2>
  <p>Log in and feel free to explore! Better User Manual coming in a few days...</p>

  <h2>Known issues</h2>
  <p>Check the <a href="https://github.com/santhoshsvkmm/saas-boilerplate/issues" target="_blank">issues</a> along with some other improvements planned.</p>
</body>
</html>