# SoPra FS26 Assignment 2

Source PDF: `SoPraFS26_Assignment_2.pdf`

## Page 1

Software Praktikum (SoPra) - FS26
Milestone 2 - Assignment
1 General Information
The focus of Milestone 2 is on designing, specifying, and planning the upcoming implementation
phase of your project. The deadline is on Friday,20.3.2026 23:59 CETand includes the deliverables
listed below. On the following Monday, 23.3.2026, you will present a short progress update for
Milestones 1 and 2 (combined).
1.1 Deliverables Overview
Report: as PDF with a name of form FS26-Group-XX-M2-Report.pdf.
Presentation: as PDF with a name of form FS26-Group-XX-M2-Slides.pdf.
Application URLs: Deployment, GitHub, and SonarQube URls submitted via OLAT form.
Source Code and Projects Board:hosted on GitHub (public; with git tags “M2”).
Team Questions (including Brownie Points)individually submitted via OLAT.
2 Assignment Description
During Milestone 1, you familiarised yourself with the infrastructure and formulated user stories
for your application. Based on feedback for the M1 report and the created artifacts, you will
now refine the user stories and decide which ones to include in your first Sprint. Further, you
will create UML diagrams, the interface specification, and UI mockups. After this milestone, you
should have a clear understanding of how the implementation phase of Milestone 3 should look
like.
2.1 Diagrams
Based on the user stories from M1, create a design for the web service using component, class,
and activity diagrams with the UML standard.
Component Diagram: Define the architecture of your application using a component diagram
1. These diagrams are used to visualize the organization and relationships among components
1https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-
component-diagram/
1

## Page 2

in a system. There are at least three major components in your application (i.e., client, server,
and database). Define these components and how they interact. Specify interconnections among
components utilizing provided and required interfaces.
Class Diagram:Domain modeling helps you to identify the relevant concepts (or entities) that de-
scribe the domain of your system (e.g., in case of a typical board game, “Game” and “Player” are
examples of entities). Use a class diagram 2 to define the domain model of your backend system.
A domain model is a set of major classes that represent the application (including an indication
of what will be persisted). Notice that you do not have to model the auxiliary classes used in
the SpringBoot ecosystem (e.g., repository, controllers, or services). Choose the granularity of the
class diagram in a way that the combination of it and the user stories serve as a good basis for the
implementation of your backend.
Activity Diagram:Model the overall workflow of the system with an activity diagram 3. Choose
the right granularity, such that your diagram reflects the most important activities of the appli-
cation (e.g., “performing an action”; for the popular board game UNO, that could be “drawing
cards from the stack”). An activity diagram is used to represent the flow from one activity to an-
other. Its purpose is to identify which activities (i.e., functions provided by the system) you have
to implement and how they are associated with constraints and conditions.
2.2 Specification of the REST Interface
For the communication between the client and the server, a REST interface will be used. You
have to create a specification for this REST interface. In particular, describe the entities with
their operations, parameters, parameter types, returned values, and HTTP status codes. For an
example of a REST specification, please refer to assignment sheet 1. With a precise specification,
developers of the client and server should be able to work independently on their tasks.
Advice: Use the methods (HTTP verbs) as they were intended to. Use HTTP status codes to
indicate correct or incorrect requests. Optionally, design your interface in a way such that it
follows the HATEOAS principle4 as described in this guide5.
2.3 User Interface Design – Mockups
For this part of the assignment, you have to create mockups for the whole user interfaceof
your future web application. Describe the flow among the different screens of your application.
Specifically, describe how your application transitions from one screen to another (e.g., a lobby
screen is shown after a successful login).
Advice: You can create the mockups with a dedicated tool if you wish. Examples are: Figma 6,
Lucid Chart7, Adobe XD 8, or Balsamiq Mockup 9 (platform independent). For some tools (e.g.,
Figma) you should use your UZH email address to register in order to profit from student pack-
ages and to use the tool collaboratively.
2https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-
diagram/
3https://circle.visual-paradigm.com/docs/uml-and-sysml/activity-diagram/
4https://restfulapi.net/hateoas/
5https://spring.io/guides/gs/rest-hateoas/
6https://figma.com
7https://www.lucidchart.com/pages/examples/wireframe
8https://www.adobe.com/products/xd.html
9http://balsamiq.com/products/mockups/
2

## Page 3

2.4 Setting Up Development Infrastructure
During this milestone, one group member has to prepare the development infrastructure ahead
of the implementation phase in Milestone 3. This task is fulfilled if your group has one commit in
your client repository that changes the user interface to display your group name on the deployed
client.
GitHub and Deployment
To set up GitHub, and Google Cloud/Vercel deployment, we will reuse the setup described in the
individual assignment of M1, adapting only minor details. We recommend using Google Cloud
for the server and Vercel for the client. You are allowed to deploy both on one platform, but if you
do, we will not provide support in case of issues.
1. Create the client and server template repositories as described in assignment sheet 1. Make
sure to set them to public. Add all team members as collaborators.
2. For the server deployment, set up Google Cloud as described in assignment sheet 1, but use
the project name sopra-fs26-group-XX-server.
3. On Google Cloud, invite your team members by navigating to “IAM & Admin > IAM >
Grant Access”. Enter the email addresses of your peers as “New Principals”.
4. For the client deployment, set up Vercel as you did on Milestone one, but use the project
name sopra-fs26-group-XX-client.
5. Vercel usually deploys automatically for every push when the repository is connected to
GitHub. If deployments are not triggered automatically (for example due to permission
or configuration issues), you may set up a GitHub Action to automate deployments. You
can either follow this official guide 10, or use the pre-configured workflow file available at
.github/workflows/verceldeployment.yml. Please verify if deployments are triggered automati-
cally in your setup to avoid accidentally deploying the app after the deadline. If you prefer,
you may disable the automatic GitHub deployments and rely only on the GitHub Action
workflow by configuring the github.autoJobCancellation option in your vercel.json file.
6. For the GitHub Action to function correctly, you must add the required Vercel secrets to your
GitHub repository. Navigate to “Settings > Secret and variables > Actions > New repository
secret” tab from the menu on the left in your GitHub repository. Add the following secrets
with values retrieved from your Vercel account:
• VERCEL_TOKEN: go to “Vercel > Account Settings > Tokens”. Under “Create Token”,
insert a name, select your project as the scope, choose the expiration date, and click
on the Create button. Copy the generated token and add it as a secret in the client
repository.
• VERCEL_ORG_ID: go to “Vercel > Account Settings > General”. Scroll down to “Vercel
ID”. Copy it add it as a secret in the client repository.
• VERCEL_PROJECT_ID: go to the Vercel Dashboard, select your project, and go to
“Project Settings”. Scroll down to “Project ID”. Copy it add it as a secret in the client
repository.
7. Finally, commit and push the repository changes to display your group name and set git
tags named “M2” on the main branches.
SonarQube for Code Quality
Additionally to the basic setup, we will use SonarQube to measure the quality of our code. More
precisely, we use the free cloud services from SonarQube for open source projects.
10https://vercel.com/guides/how-can-i-use-github-actions-with-vercel
3

## Page 4

1. One team member has to create an account onhttps://www.sonarsource.com/products/
sonarcloud/signup/ by clicking the “GitHub” icon. Follow the installation guide and
set up both the server and client projects. If asked to add an organization, select your GitHub
username in the list.
2. In the projects dashboard > Administration, click “Analysis Method” and next “With GitHub
Actions”. Set the SONAR_TOKEN as instructed. For your server project, select “Gradle” to
update the build files. For your client project, select “Other (for JS, TS, Go, Python, PHP ,
...)”.
3. For the server repository, set the SonarQube properties in build.gradle as shown on the
instructions page on sonarcloud.
4. For the client, update the SonarQube properties in sonar-project.properties.
If your configuration is successful, the next time you push code to your remote repositories on
GitHub (main), your SonarCloud dashboard should show a quality assessment of your code.
2.5 Scrum Setup on GitHub
After having established user stories in Milestone 1, we will refine and transfer them to GitHub
using Issues (11) for managing them during Milestones 3 and 4.
1. On GitHub, enter each (revised) user story as a GitHub Issue to the server repository. Use
the title field for your user story in the role-goal-benefit format.
2. In the description of the user stories, use Markdown12 to create a Task List of acceptance
criteria. Ensure that your user stories are not too broad, often indicated by very big lists of
acceptance criteria.
To keep an overview of all user stories and development tasks, which we will define next, we will
set up a GitHub Projects board. 13
1. Create a new GitHub Projects board (GitHub > Projects > new project). Make sure to set its
visibility to “public”.
2. Select the hidden fields “Repository” and “Milestone” to render them visible.
3. Define new fields named “Type” (single select items: “User Story” and “Task”), “Priority”
(single select items: “high”, “medium”, “low”), “Time Estimate (h)” (number), and “Week”
(iteration; set the start date to the first weekly TA meeting date after M2).
4. Finally, add all “user story” Issues from the server repository to the board. Set the “Type”
field accordingly.
SoPra follows the Scrum methodology 14. In Scrum, software development is organized in units
called “Sprints”. Each Sprint is a time-boxed effort. The duration of a Sprint is usually 2 to 4
weeks. Since you are not working full time on your project, we choose the Milestone meetings as
Sprint deadlines. Next, we will set up the Sprint for Milestone 3.
1. Create a GitHub Milestone named “Sprint 1”, set its end date to the Milestone 3 deadline.
2. Add the GitHub Milestone to user stories you plan to work on during Sprint 1 (Sprint Back-
log).
11https://guides.github.com/features/issues
12https://guides.github.com/features/mastering-markdown/
13https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-
projects/about-projects
14https://en.wikipedia.org/wiki/Scrum_(software_development)
4

## Page 5

3. Visualize the Sprint Backlog by creating a new GitHub Projects View of type “Board” and
with filter “Milestone: Sprint 1”. Save the modified View.
During a Sprint, we will work on development tasks, which are part of a decomposed user story. A
development task is a smaller, more manageable entity and should be assigned to a single team
member.
1. In the description of all user stories you selected for the upcoming Sprint, create a Mark-
down Task List of development tasks.
2. Each development task item can now be turned into its own GitHub Issue. Hover over
items of the Task List and click “Convert to Issue” (you may need to refresh the browser
tab). Notice how auto-generated “development task” Issues are tracked by the (parent)
“user story” Issue.
3. Transfer “front-end” development tasks to the client repository.
4. Add all “development task” Issues to the GitHub Projects board. Set the “Type” field ac-
cordingly.
5. Development tasks require prioritization and a time estimate. Set the fields accordingly. As
a rule of thumb, each development task should not take longer than a day (it is better if they
are a bit shorter).
Advice: With Scrum, you should have a “shippable product” after each Sprint. In your Milestone
3 presentation, you are expected to show a running application with a basic feature set. Therefore,
we suggest planning most implementation work during Milestone 3.
2.6 Optional: Setting up Hugging Face (latest by March 15)
If you would like to use Hugging Face, for example for model inference applications such as gen-
erative AI chat completion (seehttps://huggingface.co/docs/inference-providers/
en/index), you can do so via the UZHedu Hugging Face organization free of charge. This is
completely optional and will count as your external API. If you want to set up Hugging Face,
you must complete the steps below by March 15. After that date, joining is no longer possible.
1. If you do not yet have a Hugging Face account registered with your @uzh.ch email, create
one using your @uzh.ch email address. Important: If you sign up with any email other
than @uzh.ch, your account will be removed from the UZHedu Hugging Face organiza-
tion.
2. Use this invite 15 to join the UZHedu Hugging Face organization (make sure you are logged
into your @uzh.ch Hugging Face account). The invite is only valid until March 15.
3. Generate a personal access token at https://huggingface.co/settings/tokens. Se-
lect the permissions you need for your intended use. Pay special attention to Org permis-
sions. For inference providers, search for UZHedu under “Org permissions” and enable all
inference related permissions for the UZHedu organization.
4. In your code, route billing to the UZHedu organization (and not to a personal account) by
setting bill_to="UZHedu" For example:
client = InferenceClient(
provider="<provider-name>",
api_key="<personal-access-token>",
bill_to="UZHedu"
)
5. Please use the Hugging Face API responsibly and with common sense. Usage is monitored
to ensure fair access for everyone.
15https://huggingface.co/organizations/UZHedu/share/WNlNnpXDRahPLnuFFcXxiEgPNdxSMysyOZ
5

## Page 6

3 Grading and Deliverables
SoPra is a pass/fail course and the grade for M2 will be pass/fail as well. Overall, you have to
pass 3 out of 4 milestones, where M1 and M4 have to be passed. You need to hand-in reasonable
reports for all the milestones. You will receive feedback on your deliverables including an assess-
ment (either pass, borderline pass, or fail) in the upcoming weeks after the deadline.
Report
The report should be submitted as PDF to OLAT with a name of formFS26-Group-XX-M2-Report.pdf
by the group leader. It should comprise the 3 UML diagrams, a REST specification, and mock-
ups. We will evaluate the quality and completeness of your UML diagrams as well as the clarity
of your mockups. Regarding the REST interface, we will evaluate the quality, practical feasibil-
ity, and completeness of the proposed APIs. Please make sure the title page contains the group
name, group leader, and information about all group members (name and matriculation number,
GitHub handle).
Presentation Slides
The slides should be submitted as PDF to OLAT with a name of formFS26-Group-XX-M2-Slides.pdf
by the group leader. The presentation must include results from Milestones 1 (group phase) and 2
and should not take more than 3 minutes (hard cut-off). We suggest focusing on clearly introduc-
ing and motivating your project. Further, use user stories and mockups to walk your audience
through the key functionality of your proposed application. The title slide should consist of the
group name and the names of all group members. Underline the name of the presenter(s) on the
title slide. The slides and the presentations have to be in English. Please note that each team
member has to present at least once (M1+M2, M3, or M4).
Application URLs
The URLs of your application deployments on Google Cloud and Vercel are submitted via a form
on OLAT by the group leader. In the same OLAT form, you will also be able to enter the URL to
your GitHub repositories and SonarQube. The infrastructure setup is complete when the front-
end of the deployment displays your group name.
Source Code and Projects Board on GitHub
The source code on GitHub is submitted by setting your repositories to “public” and adding git
tags “M2” to commits in the “main” branches that should be taken into consideration for grading.
Similarly, your GitHub Projects board is submitted implicitly and must be set to “public”. The
board should show your Product Backlog, including user stories and development tasks, and
provide a view of your upcoming Sprint Backlog. We will assess your Sprint planning both in
terms of the covered development effort, the user stories decomposition into development tasks,
and the overall quality of the board. Ensure that each development task is derived from a user
story, has a priority, and that every group member has 2 tasks assigned (for the first week of the
Milestone 3).
Team Questions (Including Brownie Points)
In addition to the group assessment, we will use a “brownie points” system for which you have to
distribute brownie points to you and your team members. The brownie points should reflect how
you feel about your contribution to others and the contribution of other team members to your
learning, the assignment, and team’s performance. Distributing brownie points will be an oppor-
tunity to reward the members of your team who worked hard on your behalf. You can split the
brownie points equally if you think everyone did the same. Every student has 50 brownie points
6

## Page 7

to distribute to the 5 team members (if your team has 4 members, only distribute 40 brownie
points). These brownie points will also allow us to notice any concerns in a team early on. The
brownie points can decide whether individual group members pass or fail for borderline submis-
sions.
4 Important
In order to ensure a smooth and successful progression throughout the SoPra course, it is crucial
to adhere to certain guidelines. Keep the following points in mind for all assignments:
1. Continuous contribution is essential. Your TA will assess your weekly progress before each
TA meeting. When working on the implementation (major in Milestones 3 and 4), keep the
file contributions.md updated in the client repository.
2. Effective use of joker for continuous contribution: You can use a joker for continuous con-
tribution once throughout the semester. Ensure you announce it in advance; failure to do so
will result in a fail for the respective week.
3. Communication with TAs: Discuss with your TA about their availability to answer ques-
tions and respond to your queries. Remember, it is not their responsibility to be available
24/7, especially on weekends.
4. Deployment policy: You are only allowed to deploy before the deadline. Deploying after
the deadline, regardless of changes made, will result in an automatic fail for the milestone.
5. Repository privacy: Setting your repositories to private prevents TAs from reviewing your
work and will result in an automatic fail for the duration it is set to private.
6. Commit standards: TAs will only consider commits with a task/issue number. Ensure your
commits are appropriately labeled for evaluation.
7. Persistence in project work: Students are expected to continue working on their application
until they receive a clear fail. Using the lack of assessment from the last milestone as an
excuse is not acceptable.
7
