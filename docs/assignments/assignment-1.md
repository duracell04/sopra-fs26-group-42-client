# SoPra FS26 Assignment 1

Source PDF: `SoPraFS26_Assignment_1 (2).pdf`

## Page 1

Software Praktikum (SoPra) - FS26
Milestone 1 - Assignment
1 General Information
Assignment 1 consists of two parts:
(1) An individual partin which each student has to familiarize themselves individually with the
frameworks and languages used for the course and implement three user stories. NOTE: The
individual part must be passed successfullyto pass the course.
(2) A group partfor which students have to form groups of 5 (make sure to join a group on OLAT
before Friday, 20.02.2026, 23:59 CET), decide on the project/application they want to develop,
and come up with the requirements in the form of user stories.
The deliverables and deadlines for Milestone 1 are listed in the table 1. More details can be found
in Section 3.
Table 1: Milestone 1- Deliverables and Deadlines
Description Date Time Location
Group Registration (individually) February 20 23:59 CET OLAT
Fill out Reflection Survey (individually) February 20 23:59 CET OLAT
Source Code and URLs (individually) March 5 23:59 CET OLAT
Brownie Points (individually) March 5 23:59 CET OLAT
Assessment Task Review (individually) March 9 - in person
Project Report (as group) March 5 23:59 CET OLAT
Project Presentation (as group) March 23 08:00 CET in person
2 Assignment Description
The first assignment is about familiarizing yourself with the development environment (individ-
ually) and to ideate and define a project idea (as a group).
1

## Page 2

2.1 Individual Phase
In the individual phase, every student is expected to familiarize themselves with the different
technologies needed for the group project. To get started, basic application templates are pro-
vided, and you will have to implement different modifications, as defined in the users stories. We
will use the React framework Next.js for the front-end, Spring Boot and Java 17 for the back-end,
REST as the interface between front-end and back-end, and JPA/Hibernate for persistence. To
get your application up and running, you are supposed to deploy your front- and back-end to
separate instances on Google Cloud 1 or Vercel Platform2. Do not be discouraged if you are un-
familiar with many of the terms/frameworks; this assignment is designed to familiarize yourself
with them.
Note: each student has to perform this part of the assignment on their own; this will also ensure
that everyone will be able to contribute during the group development phase!
Setting Up Repositories Locally and on GitHub
To get started with the individual assignment, we will set up the application templates.
(1) Create an account on GitHub 3 if you do not have one yet.
(2) Generate an ssh key for your local machine 4 and add the id_rsa.pub key to your GitHub
account5. This step will simplify authentication with GitHub.
(3) Create repositories from the templates provided for the course:
• Navigate to the server6 template repository on GitHub.
• Click the "Use this template"button at the top of the repository page.
• Create a private repository for the server. For this task, private repositories must be used.
• Repeat the process for the client7 template.
• If you prefer, you can also clone the repositories locally into a folder (see tutorial8)
Setting up Google Cloud
We will use GitHub Actions9 to automatically deploy our server application to Google App En-
gine, an application platform of Google Cloud. Follow the steps below to get started:
1. Fill out this form to get student credits worth $50 for your personal Google Cloud account10.
You will receive a coupon via email. Follow the instructions in the email to redeem the
coupon and create an account. Link: https://gcp.secure.force.com/GCPEDU?cid=
qsYpTJ5SMmWQszKmtsaR4zssfLx7UnWetwvhbpYgM%2B7fFM44r6P3e2Vny6UN5%
2F2B/
1https://cloud.google.com
2https://vercel.com/
3https://github.com/
4https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-
and-adding-it-to-the-ssh-agent
5https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-
your-github-account
6https://github.com/HASEL-UZH/sopra-fs26-template-server
7https://github.com/HASEL-UZH/sopra-fs26-template-client
8https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-
repository
9https://github.com/features/actions
10Be careful not to spend too much credits during the individual phase. You may need them in later stages of the course.
2

## Page 3

2. Create a project for your server in the Google Cloud console. Use the following naming con-
vention for the projects: “sopra-fs26-lastname-firstname-server”. If the application name
exceeds the character limit, use your UZH shortname instead of the full name. After suc-
cessful creation of the projects, make sure to perform the following.
3. Using the navigation menu in the top left (select “Products”), navigate to “IAM & Admin
> Service Accounts” in your Google Cloud dashboard. Create a new service account and
grant it “Editor” role. Next, create a key (“Actions > Manage keys > Add key > Create new
key”) for this service account with type “JSON”.
4. Navigate to “App Engine” (or type it in the search bar) and create a new “Application”.
Make sure to pick a suitable region (e.g., “europe-west6”) and select the service account
from the previous step.
5. Next, navigate to “APIs & Services”. Enable the “Cloud Build API” and the “App Engine
Admin API”.
6. On GitHub (in the server repository), go to “Settings > Secret and variables > Actions > New
repository secret” tab from the menu on the left and add the content of the downloaded
JSON service account key as GCP_SERVICE_CREDENTIALS.
7. At this point, when you push code to your “main” branch on GitHub, it will try to automat-
ically deploy to Google App Engine. The GitHub action which pushes your code to Google
Cloud is configured in .github/workflows/main.yml.
8. After your first deployment attempt, you can monitor its progress under “Actions” on
GitHub and under “Cloud Build” on the Google Cloud Platform.
9. Once the server is deployed successfully:
• Copy the URL of the server application from the Google App Engine dashboard,
• Go to the client repository and open the file app/utils/domain.ts ,
• Add the server URL as an environment variable ( NEXT_PUBLIC_PROD_API_URL) in
app/utils/domain.ts,
• Re(-deploy) the client.
If the server URL is incorrect or missing, you might see an alert “The server cannot be
reached. Did you start it?” when trying to login.
10. Information about the client deployment on Vercel can be found in the file readme.md of
the template repository.
Individual Implementation of User Stories
To complete the individual part of the assignment, each student has to implement the client and
server parts for the three user stories listed below and according to the REST specification of Table
2.1. The REST API specifies the communication interface between the client and the server. Please
consider that there is already a built-in login function in the provided templates that lets you
automatically register a new account. You are expected to modify this function when working on
the three user stories. For login and registration, a good approach could be to create one screen
for the login and another one for the registration of new users. The login functionality must allow
only registered users to log in.
3

## Page 4

ID: S1 Category: User Management
Story: As an unregistered user, I want to be able to register as a user with my chosen credentials
(i.e., username and password, that are both not empty words, and a short bio) to leverage/use
services and information that are exclusively available to registered users.
Acceptance Criteria:
• Upon successful user registration, the user profile screen is shown, and the user is automati-
cally logged in.
• Upon failure, an error is displayed, and the user is redirected (back) to the register screen.
A register error can be that a user name is already taken.
• The creation date of a user is saved to the database record.
• Logged-in users can log out and log back into their registered profile.
Priority: critical
Author: SoPra Assistants
Estimate: 4h
ID: S2 Category: User Management
Story: As a logged-in user, I want to inspect a registered user’s profile by selecting the username
in a list of all registered users.
Acceptance Criteria:
• A user can view a list of all registered users ( users overview) by clicking on a button or link
in the user profile screen.
• You can select each one for inspection.
• By clicking on a username in the users overview, you are redirected to a profile page of the
selected user.
• The profile page contains the following data belonging to the selected user: username, on-
line status, creation date, and bio.
• The users overview and the profile page are only accessible for logged-in users.
Priority: critical
Author: SoPra Assistants
Estimate: 8h
4

## Page 5

ID: S3 Category: User Management
Story: As a logged-in user, I want to edit my password.
Acceptance Criteria:
• By clicking on an edit password button in theuser profile screen, you are able to change your
password.
• A registered user can only change their own password and not passwords of other users.
• After changing and saving the data, the user is logged out and redirected to the login page,
and can log in with the new password.
Priority: critical
Author: SoPra Assistants
Estimate: 8h
Testing the REST interface
In order to design and reason about the REST endpoints that you need to implement for the user
stories, you are also expected to write at least 4 additional tests to cover all 6 mandatory mappings
defined below (2 tests already exist). These tests are part of the back-end project and have to be
implemented using JUnit. The tests have to examine the REST endpoints by passing required
data to the endpoint and validating/checking the returned result with assertions. Please make
sure that:
• you handle data passing properly (i.e., is the data passed as query parameters or as part of
the HTTP body?)
• the correct HTTP method is used (GET, POST, PUT, or DELETE)
• the response sends the resulting data (if necessary) in the correct format
• the correct HTTP status code is sent (for success or failure)
• the correct HTTP header fields are set (e.g., Accept, Content-Type)
For the three user stories and the tests, you are expected to comply with the following REST
specification:
Mapping Method Parameter Paremeter Status Response Description
Type Code
/users POST username <string>, pass-
word <string> Body 201 User (*) add User
/users POST username <string>, pass-
word <string> Body 409 Error: reason<string> add User failed because
username already exists
/users/{userId} GET userId<long> Query 200 User (*) retrieve user profile with
userId
/users/{userId} GET userId<long> Query 404 Error: reason<string> user with userId was not
found
/users/{userId} PUT User Body 204 < update user profile
/users/{userId} PUT User Body 404 Error: reason<string> user with userId was not
found
User:
id<long>,
5

## Page 6

username<string>,
creation_date<Date>,
status<string>,
bio<string>
Listing 1: User Object
Remarks:
• (*) The user object is defined in Listing 1.
• Follow the REST specification carefully. We may test your implementation against the pre-
defined endpoints, and we expect all of them to work.
• During the individual assessment, you have to demonstrate your own tests and their suc-
cessful passing to the examiner.
• The REST specification does not cover user login and registration. Find appropriate routes
to cover them!
• For the implementation, you have to come up with the correct response if an unautenthi-
cated request wants to access /users/{userid}
Advice: The User data passed to update a user profile does not have to contain all fields saved
for a user (as by the definition of HTTP put). Only include the data fields necessary to identify
the user to be updated and the fields that should be updated.
2.2 Group Phase
The main goal of the group phase of Milestone 1 is to form groups of 5 students each, come up
and decide on your group project, and identify/elicit the requirements in the form of user stories.
We expect each group to develop a project idea that reflects their personal interests. During this
lab course, you will have the opportunity to be creative in terms of the application. We hope this
will be more fun and you get a chance to work on something interesting and exciting to you.
To motivate your project, think of the underlying problem (i.e., what you want to solve)
and provide the rationale for it. In particular, justify why your application solves the specified
problem, why your project is interesting, and why it makes sense as a web application in this
course.
For fairness reasons and to ensure that the scope of the projects for this course is similar,
your project and application have to fulfill the following requirements. Each project has to...
• use the same technology stack (Next.js, React, Java, Spring Boot, GitHub, Google Cloud,
Vercel, JPA). If you want/need to deviate from this for justified reasons, please talk to us as
soon as possible.
• have a client-server architecture with a web front-end. It cannot just be a command-line
interface.
• interact with a server with a REST API that you created.
• have some persistence layer, i.e., you need to store something in a database, such as user
data and more.
• feature collaboration capabilities where different user profiles interact in “quasi” real-time
to achieve a shared goal (collaborative editing of an artifact (e.g., a game or document)11.
11A basic chat is not considered a valid collaborative feature.
6

## Page 7

• perform some useful function and cannot just be a database management app (e.g., simple
CRUD apps that do not make sense).
• work with a small user base. It cannot require crowd buy-in to be useful (e.g., think social
networks – apps that require large numbers of users to be useful).
• consume at least one external API (e.g., a translation or computer vision service). Notice
that the external API should be an integral part of your application. Please refrain from
using Authentication/Identity services such as "Sign-in with Google".
• be built from scratch. During this course, you cannot continue working on already existing
projects. Further, the following games are not allowed this year as they have been imple-
mented multiple times over the past years: “Brändi Dog”, “Chess”, “Jass”, “UNO”, “Cards
against Humanity”, “Trumps” and simple trivia games.
To ensure a similar scope across all proposed applications, discuss your ideabeforehand with
your TAs and think about a ‘simple’ implementation and an ‘extensive’ implementation of your
idea so that one can easily adjust the scope. Think of ‘optional’ user stories that one could easily
implement if needed.
User Stories
Determine and specify the requirements for your application in the form of user stories. Each
user story should be in the role-goal-benefit format "As a <Role>, I want to <Goal> in order to
<Benefit>", with acceptance criteria that have several tests to determine if the use case described
by the user story is satisfied. Further, add a rough time estimate to each user story, add an ID, and
prioritize it.
There is no minimum or maximum number of user stories you must have. However, the user
stories need to cover all functionalities of the app. It would be surprising if it ended up being less
than 10. At the same time, you should not have way too many user stories. For the past years,
15 user stories were often sufficient to describe the main requirements. Make sure the set of user
stories is sufficient and complete, even if not all of them will be implemented in later stages of
this course.
3 Grading and Deliverables
SoPra is a pass/fail course. To pass the course, you, as an individual, have to pass the individual
part of Milestone 1, and as a group, you have to pass 3 out of 4 milestones and you have to pass
Milestones 1 and 4. Further, you are expected to hand in reasonable reports for all milestones. In
order to pass M1, you have to pass both the individual and the group phase of M1.
3.1 Individual Phase
For the individual phase, the 1:1 assessments and your code submission decide about pass/fail.
Source Code and URLs
Submit (a) one ZIP file, containing the source code for the individual part, and (b) the URLs for
your client and server application on Google Cloud and Vercel to OLAT byThursday, 05.03.2026,
23:59 CET. The source code in the ZIP file has to include the client and server code (with the
tests). For the client repository submission, please delete the node_modules folder before
compressing it. For the ZIP file, use a file name of the form “FS26-LASTNAME-FIRSTNAME-
M1.zip”. In addition to the ZIP file, insert the deployment URLs pointing to your client and
server applications on OLAT to the input fields under "Individual Assignments - Deployment
7

## Page 8

URLs".
Individual Task Review
We will assess the individual assignment with 1:1 meetings on Monday, 10.03.2026(exact times
will be announced on OLAT). Each student is required to present their solution and answer
questions asked by the course staff.
Make sure you have deployed your front-end and back-end to Google Cloud before the
submission deadline. Further, open your source code and tests in your editor of choice. The
staff will assess the functionality and completeness of the submission and will ask you questions
related to the assignment.
3.2 Group Phase
The group phase is assessed based on your report and has to be completed as a team. After
the Milestone 1, you will receive feedback on your report, including an assessment (either pass,
borderline pass, or fail).
Project Report
Submit a PDF project report (one per team) before Thursday, 05.03.2026, 23:59 CET. Your report
should comprise a project title, a short project description (max. 150 words), and the elicited
user stories for the development phase of your project. The short description should include a
problem statement, project motivation, and a few words on how you plan to solve the specific
problem as well as why it is a suitable web application for this course.
Formally, the report has to be written in English and submitted by one team member via
OLAT. It must start with a title/cover page that lists the group name and information of each
group member (name, UZH email, matriculation/student number, and GitHub username).
Ensure the report is easily readable in printed form (figures, tables, etc.). Furthermore, ensure
to use consistent formatting (header, footer, font style, font size, page numbers, figure and table
titles, etc.), page orientation (portrait), and page size (DIN A4). Finally, use the naming style
“FS26-Group-GROUPNUMBER-M1-Report.pdf” to upload your report.
Presentation
The group part of Milestones 1 has to be presented together with the part of Milestone 2 onMon-
day, 23.03.2026. During the presentation, each member has to be able to answer content-related
questions to every part of the report.
Brownie Points
In addition to the group assessment, we will use a “brownie points” system for which you have
to distribute brownie points to you and your team members. The brownie points should reflect
how you feel about your contribution to others and the contribution of other team members to
your learning, the assignment, and team’s performance. Distributing brownie points will be an
opportunity to reward the members of your team who worked hard on your behalf. You can split
the brownie points equally if you think everyone did the same. Every student has 50 brownie
points to distribute to the 5 team members (if your team has 4 members, only distribute 40
brownie points). These brownie points will also allow us to notice any concerns in a team early
on. The brownie points can decide whether individual group members pass or fail for borderline
submissions.
8

## Page 9

4 Important
In order to ensure a smooth and successful progression throughout the SoPra course, it is crucial
to adhere to certain guidelines. Keep the following points in mind for all assignments:
1. Communication with TAs: Discuss with your TA about their availability to answer ques-
tions and respond to your queries. Remember, it is not their responsibility to be available
24/7, especially on weekends.
2. Deployment policy: You are only allowed to deploy before the deadline. Deploying after
the deadline, regardless of changes made, will result in an automatic fail for the milestone.
3. Repository privacy: The individual repository must be private, but the group repository
must be public. Setting your group repositories to private prevents TAs from reviewing
your work and will result in an automatic fail for the duration it is set to private.
4. Persistence in project work: Students are expected to continue working on their application
until they receive a clear fail. Using the lack of assessment from the last milestone as an
excuse is not acceptable.
9
