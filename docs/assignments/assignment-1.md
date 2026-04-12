# SoPra FS26 Assignment 1

Source PDF: `SoPraFS26_Assignment_1.pdf`

## 1. General Information

Assignment 1 consists of two parts:

1. **Individual part**: each student familiarizes themselves with the frameworks and languages used in the course and implements three user stories.
   Note: the individual part must be passed successfully to pass the course.
2. **Group part**: students form groups of 5, join a group on OLAT before **Friday, 20.02.2026, 23:59 CET**, decide on a project/application, and define the requirements as user stories.

The deliverables and deadlines for Milestone 1 are listed below. More details are provided in Section 3.

### Deliverables and Deadlines

| Description | Date | Time | Location |
| --- | --- | --- | --- |
| Group Registration (individually) | February 20 | 23:59 CET | OLAT |
| Fill out Reflection Survey (individually) | February 20 | 23:59 CET | OLAT |
| Source Code and URLs (individually) | March 5 | 23:59 CET | OLAT |
| Brownie Points (individually) | March 5 | 23:59 CET | OLAT |
| Assessment Task Review (individually) | March 9 | - | in person |
| Project Report (as group) | March 5 | 23:59 CET | OLAT |
| Project Presentation (as group) | March 23 | 08:00 CET | in person |

## 2. Assignment Description

The first assignment is about:

- familiarizing yourself with the development environment individually
- ideating and defining a project idea as a group

### 2.1 Individual Phase

In the individual phase, every student is expected to familiarize themselves with the different technologies needed for the group project. Basic application templates are provided, and you will implement modifications defined by the user stories.

The course stack includes:

- front-end: React framework `Next.js`
- back-end: `Spring Boot` and `Java 17`
- interface: `REST`
- persistence: `JPA` / `Hibernate`

To get your application running, deploy the front-end and back-end to separate instances on:

- Google Cloud
- Vercel Platform

Do not be discouraged if many of the terms or frameworks are unfamiliar. This assignment is designed to familiarize you with them.

Note: each student has to perform this part on their own. This ensures that everyone can contribute during the group development phase.

### Setting Up Repositories Locally and on GitHub

To get started with the individual assignment, set up the application templates:

1. Create a GitHub account if you do not have one yet.
2. Generate an SSH key for your local machine and add the `id_rsa.pub` key to your GitHub account. This simplifies authentication with GitHub.
3. Create repositories from the templates provided for the course:
   - Navigate to the server template repository on GitHub.
   - Click the `Use this template` button.
   - Create a **private** repository for the server. Private repositories must be used for this task.
   - Repeat the process for the client template.
   - If you prefer, you can also clone the repositories locally into a folder.

### Setting Up Google Cloud

GitHub Actions will automatically deploy the server application to Google App Engine. Follow these steps:

1. Fill out the form to get student credits worth `$50` for your personal Google Cloud account. You will receive a coupon by email. Follow the instructions in the email to redeem the coupon and create an account.
   Link:
   `https://gcp.secure.force.com/GCPEDU?cid=qsYpTJ5SMmWQszKmtsaR4zssfLx7UnWetwvhbpYgM%2B7fFM44r6P3e2Vny6UN5%2F2B/`

2. Create a project for your server in the Google Cloud console using this naming convention:
   `sopra-fs26-lastname-firstname-server`
   If the application name exceeds the character limit, use your UZH shortname instead of your full name.

3. In Google Cloud, go to `IAM & Admin > Service Accounts` and:
   - create a new service account
   - grant it the `Editor` role
   - create a new key via `Actions > Manage keys > Add key > Create new key`
   - choose key type `JSON`

4. Navigate to `App Engine` and create a new application.
   - Pick a suitable region, for example `europe-west6`
   - Select the service account created in the previous step

5. Navigate to `APIs & Services` and enable:
   - `Cloud Build API`
   - `App Engine Admin API`

6. In the server GitHub repository, go to:
   `Settings > Secret and variables > Actions > New repository secret`
   Add the contents of the downloaded JSON service account key as:
   `GCP_SERVICE_CREDENTIALS`

7. When you push code to the `main` branch on GitHub, it will try to deploy automatically to Google App Engine.
   The GitHub Action is configured in:
   `.github/workflows/main.yml`

8. After the first deployment attempt, monitor progress under:
   - `Actions` on GitHub
   - `Cloud Build` on Google Cloud

9. Once the server is deployed successfully:
   - copy the server application URL from the Google App Engine dashboard
   - open `app/utils/domain.ts` in the client repository
   - add the server URL as the environment variable `NEXT_PUBLIC_PROD_API_URL`
   - redeploy the client

   If the server URL is incorrect or missing, you might see the alert:
   `The server cannot be reached. Did you start it?`

10. Information about client deployment on Vercel can be found in the `readme.md` of the template repository.

### Individual Implementation of User Stories

Each student must implement the client and server parts for the three user stories below, following the REST specification in Section 2.1.

The provided templates already include a built-in login function that can automatically register a new account. You are expected to modify this behavior when implementing the three user stories.

A good approach is:

- one screen for login
- one screen for registration

The login functionality must allow only registered users to log in.

#### S1: Register User

- **ID**: `S1`
- **Category**: `User Management`
- **Story**: As an unregistered user, I want to be able to register as a user with my chosen credentials (username and password, both non-empty, plus a short bio) in order to use services and information that are exclusively available to registered users.
- **Acceptance Criteria**:
  - Upon successful registration, the user profile screen is shown and the user is automatically logged in.
  - Upon failure, an error is displayed and the user is redirected back to the registration screen.
  - A registration error can be that a username is already taken.
  - The creation date of a user is saved to the database record.
  - Logged-in users can log out and log back into their registered profile.
- **Priority**: `critical`
- **Author**: `SoPra Assistants`
- **Estimate**: `4h`

#### S2: Inspect Another User Profile

- **ID**: `S2`
- **Category**: `User Management`
- **Story**: As a logged-in user, I want to inspect a registered user's profile by selecting the username in a list of all registered users.
- **Acceptance Criteria**:
  - A user can view a list of all registered users (`users overview`) by clicking a button or link on the user profile screen.
  - Each user in the list can be selected for inspection.
  - Clicking a username redirects to that user's profile page.
  - The profile page contains the selected user's username, online status, creation date, and bio.
  - The users overview and profile page are only accessible for logged-in users.
- **Priority**: `critical`
- **Author**: `SoPra Assistants`
- **Estimate**: `8h`

#### S3: Edit Password

- **ID**: `S3`
- **Category**: `User Management`
- **Story**: As a logged-in user, I want to edit my password.
- **Acceptance Criteria**:
  - Clicking an edit-password button on the user profile screen allows the user to change their password.
  - A registered user can only change their own password, not the password of another user.
  - After saving the new password, the user is logged out, redirected to the login page, and can log in using the new password.
- **Priority**: `critical`
- **Author**: `SoPra Assistants`
- **Estimate**: `8h`

### Testing the REST Interface

To design and reason about the REST endpoints needed for the user stories, you are expected to write at least **4 additional tests** so that all **6 mandatory mappings** below are covered. Two tests already exist.

These tests are part of the back-end project and must be implemented using `JUnit`.

The tests must examine the REST endpoints by passing the required data to the endpoint and validating the returned result with assertions.

Make sure that:

- data is passed correctly, either as query parameters or in the HTTP body
- the correct HTTP method is used: `GET`, `POST`, `PUT`, or `DELETE`
- the response returns the data in the correct format when needed
- the correct HTTP status code is sent for success or failure
- the correct HTTP header fields are set, for example `Accept` and `Content-Type`

### REST Specification

| Mapping | Method | Parameter | Parameter Type | Status Code | Response | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `/users` | `POST` | `username <string>`, `password <string>` | Body | `201` | `User (*)` | add user |
| `/users` | `POST` | `username <string>`, `password <string>` | Body | `409` | `Error: reason<string>` | add user failed because username already exists |
| `/users/{userId}` | `GET` | `userId<long>` | Query | `200` | `User (*)` | retrieve user profile with `userId` |
| `/users/{userId}` | `GET` | `userId<long>` | Query | `404` | `Error: reason<string>` | user with `userId` was not found |
| `/users/{userId}` | `PUT` | `User` | Body | `204` | `<empty>` | update user profile |
| `/users/{userId}` | `PUT` | `User` | Body | `404` | `Error: reason<string>` | user with `userId` was not found |

#### User Object

```text
User:
  id<long>
  username<string>
  creation_date<Date>
  status<string>
  bio<string>
```

Remarks:

- `(*)` The user object is defined above.
- Follow the REST specification carefully. The implementation may be tested against the predefined endpoints.
- During the individual assessment, you have to demonstrate your own tests and their successful passing to the examiner.
- The REST specification does not cover login and registration. You have to define appropriate routes for them.
- For the implementation, you must decide on the correct response when an unauthenticated request accesses `/users/{userId}`.

Advice:

The `User` data passed to update a user profile does not need to contain all stored user fields, despite the use of HTTP `PUT`. Include the fields needed to identify the user and the fields that should be updated.

### 2.2 Group Phase

The main goal of the group phase of Milestone 1 is to:

- form groups of 5 students
- decide on a group project
- identify and elicit requirements in the form of user stories

You are expected to develop a project idea that reflects your personal interests. During this lab course, you are encouraged to be creative in terms of the application. The idea should be interesting, motivating, and suitable for a web application.

To motivate your project, think about the underlying problem you want to solve and provide a rationale for it. In particular, explain:

- why your application solves the specified problem
- why the project is interesting
- why it makes sense as a web application in this course

For fairness and similar scope across teams, each project must:

- use the same technology stack: `Next.js`, `React`, `Java`, `Spring Boot`, `GitHub`, `Google Cloud`, `Vercel`, `JPA`
- use a client-server architecture with a web front-end, not just a command-line interface
- interact with a server through a REST API created by your team
- include a persistence layer, for example storing user data and more in a database
- feature collaboration capabilities where different user profiles interact in quasi real-time to achieve a shared goal
- perform a useful function and not just act as a database management app
- work with a small user base and not require crowd buy-in to be useful
- consume at least one external API that is an integral part of the application
- be built from scratch

Notes:

- Authentication or identity services such as `Sign-in with Google` should not be used as the external API.
- A basic chat is **not** considered a valid collaborative feature.
- The following games are **not allowed** this year because they have been implemented many times already:
  - `Brandi Dog`
  - `Chess`
  - `Jass`
  - `UNO`
  - `Cards against Humanity`
  - `Trumps`
  - simple trivia games

Discuss your idea beforehand with your TAs and think about:

- a simple implementation
- a more extensive implementation
- optional user stories that can be added if needed

### User Stories

Specify your requirements in the role-goal-benefit format:

`As a <Role>, I want to <Goal> in order to <Benefit>`

Each user story should include:

- acceptance criteria with several tests
- a rough time estimate
- an ID
- a priority

There is no fixed minimum or maximum number of user stories, but they should cover all app functionality. It would be surprising if there were fewer than `10`, and in past years around `15` user stories were often enough to describe the main requirements.

The set of user stories should be sufficient and complete, even if not all of them will be implemented later in the course.

## 3. Grading and Deliverables

SoPra is a pass/fail course.

To pass the course:

- individually, you must pass the individual part of Milestone 1
- as a group, you must pass `3 out of 4` milestones
- Milestones `1` and `4` must be passed
- reasonable reports are expected for all milestones

To pass M1, both the individual and group phases of M1 must be passed.

### 3.1 Individual Phase

For the individual phase, the `1:1` assessments and your code submission determine pass/fail.

### Source Code and URLs

Submit the following to OLAT by **Thursday, 05.03.2026, 23:59 CET**:

- one ZIP file containing the source code for the individual part
- the URLs for your client and server applications on Google Cloud and Vercel

The ZIP file must include:

- client code
- server code
- tests

Before compressing the client repository, delete the `node_modules` folder.

Use this ZIP filename format:

`FS26-LASTNAME-FIRSTNAME-M1.zip`

In addition to the ZIP file, insert the deployment URLs for the client and server into the OLAT input fields under:

`Individual Assignments - Deployment URLs`

### Individual Task Review

The individual assignment will be assessed in `1:1` meetings on **Monday, 10.03.2026**.
Exact times will be announced on OLAT.

Each student must:

- present their solution
- answer questions from the course staff

Make sure you have:

- deployed your front-end and back-end before the submission deadline
- opened your source code and tests in your editor of choice

The staff will assess functionality and completeness and will ask assignment-related questions.

### 3.2 Group Phase

The group phase is assessed based on the report and must be completed as a team.

After Milestone 1, you will receive feedback on your report, including one of:

- pass
- borderline pass
- fail

### Project Report

Submit one PDF project report per team before **Thursday, 05.03.2026, 23:59 CET**.

The report should include:

- a project title
- a short project description of at most `150` words
- the elicited user stories for the development phase of your project

The short description should include:

- a problem statement
- project motivation
- a few words on how you plan to solve the problem
- why it is a suitable web application for this course

Formal requirements:

- the report must be written in English
- one team member submits it via OLAT
- it must start with a title or cover page
- the cover page must list:
  - group name
  - each group member's name
  - UZH email
  - matriculation or student number
  - GitHub username
- the report must be easily readable in printed form
- formatting should be consistent across:
  - header
  - footer
  - font style
  - font size
  - page numbers
  - figure and table titles
- page orientation must be portrait
- page size must be `DIN A4`

Use this report filename format:

`FS26-Group-GROUPNUMBER-M1-Report.pdf`

### Presentation

The group part of Milestone 1 is presented together with part of Milestone 2 on **Monday, 23.03.2026**.

Each member must be able to answer content-related questions about every part of the report.

### Brownie Points

Each student must distribute brownie points to themselves and their team members. These points should reflect how you evaluate:

- your own contribution to others
- the contribution of other team members to your learning
- the contribution of other team members to the assignment
- the contribution of other team members to the team's performance

Guidelines:

- you may split points equally if everyone contributed equally
- each student has `50` brownie points to distribute to the `5` team members
- if your team has `4` members, only distribute `40` brownie points

Brownie points can help identify early team issues and can affect borderline pass/fail decisions for individual group members.

## 4. Important

To ensure smooth and successful progress throughout the SoPra course, keep the following points in mind for all assignments:

1. **Communication with TAs**: discuss their availability to answer questions and respond to your queries. It is not their responsibility to be available `24/7`, especially on weekends.
2. **Deployment policy**: you are only allowed to deploy before the deadline. Deploying after the deadline, regardless of changes made, results in an automatic fail for the milestone.
3. **Repository privacy**: the individual repository must be private, but the group repository must be public. Setting the group repositories to private prevents TAs from reviewing your work and results in an automatic fail for the time they remain private.
4. **Persistence in project work**: students are expected to continue working on the application until they receive a clear fail. Using the lack of assessment from the last milestone as an excuse is not acceptable.
