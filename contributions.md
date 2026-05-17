# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 23.03.2026 to 30.03.2026

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz**| **[@remy20cent]**  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/5377434d302032526b3a41c0bdb2f3ea9186794c | Implemented user profile screen | core implementation |
|                    |  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/9efa6d73ee9633c91150217891725a411da09b25 | Added navigation from main menu to profile screen | Required for accessing profile functionality |
|                    |  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/028c54fba3573a0afa694247c7cf511e68efdc72 | Added ("X") button to return from profile screen to main menu | necessary feature |
| **Enrique Georg Zbinden** |**[@duracell04]**  | 30.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/173ca0a0037e2d8bd05fe39adfd3083cca8bdbcf | Protected `/users` against unauthenticated access by checking for a stored token before fetching protected data and redirecting logged-out users to `/login` | Prevents direct access to a protected page without a valid session and keeps restricted user data from being requested by logged-out users |
|                    |  | 30.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/2f3263f3439ff737016492f775211137705fcbb2 | Wired JaCoCo coverage reporting into Sonar and added backend login-flow tests across controller and service layers | Improves CI quality gates and verifies authentication behavior with automated tests instead of relying only on manual checks |
|**Siyang Jiang** |**[@yang0731]** | 27.03.2026   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/6421a94d54601e809c473fda85af05841c791f05] | Implemented a simple user registration page | This allows new users to register and send their credentials to the server for subsequent logins |
|                 |  | 27.03.2026   | [https://github.com/duracell04/sopra-fs26-group-42-server/compare/main...user-registration-form] | Adapt user entity and DTO to include pwd hash (and creation date) | The server now stores hashed user pwd for security/privacy |
|**Csaba Vizhanyo** |**[@csaba_vi]**   | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-server/commit/9e8f96771c4d200d5377be3a791ffaa03e441391] | [Implemented log-in functionallity (backend validation)]| [Allows users to login to acces their profile page after registration] |
|                    |  | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/4939a6b1a3605ccf68058d1df0e0450c1b9c82dd] | [Implemented log-in functionallity (front end token validation)] | [Allows users to login to acces their profile page after registration] |
|**Attila Vizhanyo**  |**[@liroAV]**  | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/bd9b3c256424cd12276b57546e3ad76bd4073188] | Implemented logout: (1) clears auth token and user ID from localStorage on logout, (2) redirects user to /login and protects the menu route from unauthenticated access| [Two distinct tasks: session teardown logic and route guard behavior — both required for secure auth flow]|


---

## Contributions Week 2 (and Springbreak) - 30.03.26 to 13.04.26

| **Student** | **Github Username** | **Date** | **Link to Commit** | **Description** | **Relevance** |
|------------|---------------------|----------|--------------------|-----------------|---------------|
| **Remy Klemenz** | **[@remy20cent]** | 01.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/467e65aac2db268881023567ee4723dc27d7a51a | Backend implementation of userstats | Required for working frontend |
|                  |                   | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/b74e6a93b8187f654e9703753912713578a743ec | Implement left and right movement within canvas | simple requirement |
|                  |                   | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/3bce282e615a242ea4fc9179a968bb70d71afd3e | Implementation of keyboard controls left and right | only frontend keyboard controls, not working with websocket |
| **Enrique Georg Zbinden** | **[@duracell04]** | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/e930400a793f673160a925e8f53f15365ae79c15<br>https://github.com/duracell04/sopra-fs26-group-42-server/commit/122e97622556603dc816a93521a2321a56977fd9 | Implemented S6 backend join-session support by adding the join endpoint, validating session code and session state, persisting joiner data, and adding focused backend tests | Enables a second player to join an existing session and verifies the join logic with automated backend tests |
|  |  | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/c9aa3ffd43bc926010f3d92e8f65419dbc3d3f29<br>https://github.com/duracell04/sopra-fs26-group-42-client/commit/e3d37444a5365b1fdc733829bbca292dd47e0434<br>https://github.com/duracell04/sopra-fs26-group-42-client/commit/3e593ae0b1ec64914f15bff9808789b4b945b94b | Implemented the frontend join-session flow, including the join page, invalid-code feedback, guest-lobby behavior, joiner start restrictions, and Next.js Suspense compatibility for search params | Completes the user-visible S6 join flow so a second player can enter a code, join the lobby, and wait for the host to start |
| **Siyang Jiang** | **[@yang0731]** | [05.04.2026] | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/d0c9c2f3351c1e17f633fa98d66ed47facecad6a] | implement gameBlockObject in frontend | frontend should be able to change the status of the blocks |
|                 |                   |[10.04.2026]  | [https://github.com/duracell04/sopra-fs26-group-42-server/commit/a20701746895b6c36e996bb3173733f3ef933d31] | Add game logic checks to backend game service and initialize GameBlock entity | The backend should have a block entity and be able to validate block selections (in GameService) to determine the status of each gameblock. |
|                 |                   |[13.04.2026]  | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/09be6a9af85c4890798045e74aa2f9a4a84023ae] | implemented bullet collision with a gameblock in frontend | It is needed for the correctness check (for elimination), that happens when the bullet collides with a gameblock. |
| **Csaba Vizhanyo** | **[@csaba_vi]** | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/37bc48fa8b2d3e12efec564f55359bfde4a5d811 | creating websocket backend setup | ensure infrastructure for websocket works, so it can later be used for critical game features like shooting and moving |
|                 |                   | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/721bc045a3ade41e2aa66fb1a68738b91a525838 | create ship entity and render it on the frontend | creating player for later gameplay |
|                 |                   | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/1fd57ab10081706c9ad1516790d5f06e575412ec | creating frontend websocket setup | ensure infrastructure for websocket works, so it can later be used for critical game features like shooting and moving |
| **Attila Vizhanyo** | **[@liroAV]** | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/58928dec989c9da9aeb1783da79041604ac47266 | Implemented session creation flow: (1) POST to backend to create a session and receive a unique code, (2) display the join code in the lobby UI so a second player can enter it | Two distinct tasks: backend API integration and lobby UI display — both required for multiplayer session setup |

---

## Contributions Week 3 - 13.04.26 to 19.04.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/ffb5fb846b56f10ddc2a34211090daf1b2c4cd4b | Update the ship position smoothly in the frontend | continuous pressing on keyboard works for movement, also backend adjustements |
|                 |                  | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/3c9cdfb338828d7ba057be9bd3b59d7d5864c2cc | Backend Websocket Implementation for movement | should synchronize player movement in real time for both players, but needs different player2 id to test |
|                    |              | date | ########################### | ########################### | ########################### |
|**Enrique Georg Zbinden** |**[@duracell04]** | 19.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/3c8cff17f8abb94952173dab40fd1159f049ed20<br>https://github.com/duracell04/sopra-fs26-group-42-server/commit/ff64745aae03f0130ec9c64d56ce6fe7a1ce2bcd | Implemented S10 backend timer support by extending game sessions with start and finish timestamps, exposing elapsed-time data, adding a finish flow, and covering the timer behavior with focused service tests | Provides the persisted timer lifecycle for session-backed play and adds backend verification for start, finish, and frozen elapsed-time behavior |
|                          |                  | 19.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/ff4073324bea43883746505d1971cc2eed5aa36f | Implemented S10 frontend timer support by showing elapsed time during gameplay, stopping after the full generated problem set is cleared, and displaying the frozen final time in a completion overlay | Delivers the user-visible timer flow required by S10 for both session-backed play and local `/play_test` runs |
|**Siyang Jiang** |**[@yang0731]** | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/c86cd872fcbb6643a0290593ef0541ca985ee34f| add block animation with initialization, falling behavior, and status change to selection on hit | blocks need to be selected for elimination, and show status with color|
|                 |                | 18.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/pull/27/changes/9c451bf34a4d80e1799e6ae45c9687668799a31d | /implement lives and score display and their updating behaviour on frontend page (#9)(#11)(#12) | This is necessary for implementing our points-based game and penalty mechanism. |
|                 |                | 18.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/338249c199f1bd521e862908cd522712dc9b0f2b | feature/implemented deducting sharedlives in backend (#12) | REST communication and sharedlives deduction logic in backend|
|**Csaba Vizhanyo** |**[@csaba_vi]** | 16.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/2d34107b9a1fa0bc6fe7c8683d34ea3db5501cfa | implemented problem generation algorithm for levels | essential for main gameplay loop |
|                   |                | 16.04 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/29efbdc43d5541092cff2bae90bcd345bc03723b | implemented back end logic so player 2 can access the generated problems from player 1 | essential for main gameplay loop |
|**Attila Vizhanyo** |**[@liroAV]** | 19.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/fde8dcb8d26f86853903efec5288c848a43ae7d5 | recognizes corrects number blocks being shot | this is important so the code knows when to give a point |
|                    |              | 19.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/3c1a0c11dc2725eeb79cac79b6e90aaa1a950ec7 | displays the current score | essential for letting the player know their current points visually |


---

## Contributions Week 4 - 19.04.26 to 26.04.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 25.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/c64b970b9bb307aa6a9e4357df60cadf555ac0b2 | Added tests for UserController | Necessary for testing |
|                 |                  | 25.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/eea284b70ee36b19e775545af627807256ef65e0 | Added tests for UserRepositoryIntegration | Necessary for testing |
|**Enrique Georg Zbinden** |**[@duracell04]** | 24.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/00245af289c0859ed14096d29217942edc09a824 | Fixed legacy backend User tests for the current `username` model, unblocked the server test pipeline, and refreshed SonarCloud coverage as part of issue #100 / PR #101 | Restored backend CI, regenerated a current JaCoCo/Sonar report, and pushed server coverage above the 50% M3 requirement |
|                          |                  | 24.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/2fbf5681760141ac4428e7a0f7ddf5982ee9a9fc | Replayed the S10 frontend timer and final-overlay work onto the updated gameplay branch after penalty/game-over integration, preserving score/lives behavior and removing stale contribution-log changes | Keeps the timer feature mergeable with the current gameplay state and delivers the user-visible elapsed-time and finish-overlay flow required by S10 |
|**Siyang Jiang** |**[@yang0731]** | Apr 21, 2026 | https://github.com/duracell04/sopra-fs26-group-42-server/pull/70/changes/027cb7e236a718a53eec294dc3c8586e800fda02 | Updates backend logic to properly trigger game over state when sharedlives reach zero (#12) | it is needed for penalty system |
|                 |                | Apr 21, 2026 |https://github.com/duracell04/sopra-fs26-group-42-client/commit/5f953618299595b8eb3541bb2dfbed955589b1a4 | implement screen flash when selecting incorrect pairs (#12) | It is needed for the penalty system so that players are clearly notified and warned when shared lives are deducted. |
|                 |                |  Apr 21, 2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/b3fbd287bb6aba3e812aac03a47d6ce4955d977a | updated frontend page for penalty system and gameover state (#12)| It is needed for implementing penalty system |
|**Csaba Vizhanyo** |**[@csaba_vi]** | Apr 22, 2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/90eff20fe0da5c2105ba3e3186175fe6fa39be9e | Implementat game over feature and improved game UI | Game over feature is essential to close the gameplay loop |
|                   |                | Apr 24, 2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/86b042eb55551ceff82c3a6573e6860ee9b56db2 | There was a bug where the numbers didnt update after shooting the correct combination, i fixed the bug | Important to not have any bugs before completing milestone 3|
|**Attila Vizhanyo** |**[@liroAV]** | 26.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/de24919e8fa7d441642a6953d866adaa884cccc5 | Fixed play-again synchronization so both players must confirm before a new game starts; differentiated player colors (creator=red, joiner=blue); reduced level generation time from ~30s to ~2s | Critical multiplayer correctness and UX fixes |
|**Attila Vizhanyo** |**[@liroAV]** |26.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/fd357c0fb1d7ca28713bc00612c682e0f9572631 | Added pause/resume feature (P key + button synced via WebSocket); added slow-mode toggle; overhauled navigation with consistent back arrows across all screens | Extended gameplay controls and polished navigation |

---

## Contributions Week 5 - 26.04.26 to 03.05.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 28.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/64d8ba3ea8a27aecdee2809aa653b7fd5f7d4727 | Added sprites for spaceship and background | Game looks more appealing, like "Invaders" inspiration |
|                 |                  | 28.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/018d69cdd41027215fac7ccf96e21d962484265a | Added sprites for Block and Shoot/Explosion soundeffect | Gameplay is more appealing |
| Enrique Georg Zbinden | @duracell04 | 03.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/dce5121dfbe99c6c8ca34169f1ee9880e6324bb8 | Implemented backend S16 game-summary support with an OpenRouter-backed feedback service using the free `openrouter/free` route, backend-only secret handling, score/highscore/time update logic, and fallback feedback when the API is unavailable. | Provides the backend foundation for S16 by generating end-game feedback safely without exposing the API key and by persisting the player's final score, highscore, and time-played statistics. |
|  |  | 03.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/ad09d80492ffb19c9324c7406fa6c7bdec8b8299 | Implemented the S16 game-summary screen that calls the backend summary endpoint after game completion and displays score, elapsed time, generated feedback, new-highscore status, and a return-to-menu action. | Completes the user-visible S16 flow by showing players their final result and feedback after the game ends. |
|**Siyang Jiang** |**[@yang0731]** | 01.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/58a67016bf30f1ce4ab5516deff7037ba3e130c5 | add loading bar to loading page | A loading progress bar provides clear feedback on loading status, helping players understand the progress during wait times and reducing uncertainty. |
|                 |                | 01.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/cf67f788d0efdac84b6a8b775020f5829312854f | fixed a but: bullet passes through blocks on hit | According to the game design, bullets fired by both the local and the other player should disappear after successfully hitting a numberblock.|
|**Csaba Vizhanyo** |**[@csaba_vi]** | date | ########################### | ########################### | ########################### |
|                   |                | date | ########################### | ########################### | ########################### |
|**Attila Vizhanyo** |**[@liroAV]** | 01.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/d2040fd66804251e0f2b53fab9750248d85dfc5b | Fixed multiplayer block tracking bug where impossible targets kept reappearing after their factors were eliminated; implemented synchronized game start so both players' blocks appear at the same time | Core gameplay correctness in multiplayer |
|                    |              | 01.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/0ada2051fa03aa2c56cae0468e91b22773d8f0b3 | Fixed production deployment — client was connecting to localhost:8080 instead of the App Engine server, making the online version completely non-functional | Required for the deployed app to work at all |

---

## Contributions Week 6 - 03.05.26 to 10.05.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 07.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/cb78cb4dd4dff30606dbeae65495190eb576b11c | Added tests for GameSessionControllerTest | Test Suite was incomplete and was missing negative and edge cases (also M3-feedback pointed this out) |
|                 |                  | 08.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/fb6e5f6752a54bce4a73e1626cc93defbe92cc5e | Added a simple How-to-play page | M3-feedback recommended adding a tutorial for the game, makes sense |
|**Enrique Georg Zbinden** |**[@duracell04]** | 07.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/886b34f3ae2ecc18456166decf269ad31f484914 | Added REST interface tests for the remaining GameSessionController endpoints, covering session creation, retrieval, joining, cancelling, problem persistence, start and finish flows. | Brings the backend closer to the M4 requirement that every REST endpoint is tested and strengthens SonarQube coverage. |
|                          |                  | 08.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/aa7fd059e845e822375ff5859d0d78b27d83cc25 | Made game-summary submission idempotent by preventing duplicate score/time updates for the same player and session, with backend tests for duplicate and non-participant submissions. | Protects S16 profile statistics from double-counting and makes the final score/highscore data reliable. |
|**Siyang Jiang** |**[@yang0731]** | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/1fb5e0672d2cf6f0209a3e8a663cd02562cbb3ba | polished user profile UI to make the style of the user interface consistent with the overall game and better matches the game's theme. | This makes the game interface look better and also aligns with the feedback we received. |
|                 |                | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/755d3dd06b521abfbf84fa514f584131cf41eb47 | Fixed the start timer in the game session so that it starts counting down immediately after the game session is created. |In our game, each game session is valid for five minutes after creation. Displaying a countdown timer on the game session interface helps users understand the session's validity period and status. |
|**Csaba Vizhanyo** |**[@csaba_vi]** | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/e45b303efc05f4eefdc83f5aeede8f3f5e4f8a5c | Add login route protection | make sure people with no accounts, have to create an account first before they can play |
|                   |                | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/8b44766472e3a89a1d8fe2ff0f6b3467f8a1645b | fix timer reset bug | fixed a bug where timer would start at 120 seconds instead of 0 |
|                   |                | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/7981f411767c372c9e9322caf9a2a360a3453474 | fix timer bug where blocks can be still shot after completing a level | fixing this bug prevents accidentaly shooting a number block after finishing a level |
|                   |                | 06.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/fc04d823b5507c893882693e023cab6484c8e7c4 | return meaningfull error messages | ensures enduser gets an understandable error message incase of failure (not a technical message only a developer would undertand)|
|**Attila Vizhanyo** |**[@liroAV]** | 10.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/b363f66 | Added GameServiceTest (6 tests) and GameBlockTest (6 tests) covering core game logic, pair resolution, score accumulation, and entity state | Improves backend test coverage toward 80% SonarQube target |
|                    |              | 10.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/c6a96ff | Added DTOMapperTest extensions, GlobalExceptionAdviceTest, and GameSessionRepositoryIntegrationTest covering DTO mapping, exception handlers, and repository queries | Further improves backend test coverage toward 80% SonarQube target |

---

## Contributions Week 7 - 10.05.26 to 17.05.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 11.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/31eb7057083d9dff4e7f316be3d8f6dbc9a0f512 | Made user profile Icons pixelated (from emoji to sprite) | to match the overall oldschool/pixelated style of the game |
|                 |                  | 11.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/2af2e79459b0dab2b5ed4fe8d28d88f9b39f8e35 | Fixed a bug where the game statistics of player2 wasnt saved in their user profile | simple bugfix, now it saves the sats for player1 and player2 as it should |
|                 |                  | 11.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/10126bc5d239e226bc92a2552adf27fc3119e4a0 | made simple css font changes for each page title to make them pixelated | to match the overall oldschool/pixelated style of the game |
|**Enrique Georg Zbinden** |**[@duracell04]** | 10.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/605e99282965dd66457126e60eea706cc761152e | Fixed OpenRouter free-router feedback parsing and added focused `OpenRouterHttpClientTest` coverage for string, array, object, blank, missing-content, and non-2xx responses. | Makes the external API integration robust and increases meaningful backend test coverage for the final M4 submission. |
|                          |                  | 11.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/999e12bd0d133f44ad26561269e134f05943e867 | Improved authentication error handling and display by extracting clearer backend error messages, showing a specific invalid-login message for 401 responses, and replacing custom inline error markup with consistent Ant Design alerts. | Improves usability and robustness of the login/register flow, which supports the final M4 usability requirement. |
|**Attila Vizhanyo** |**[@liroAV]** | 17.05.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/72356d983cb4c80e7ac71257ba6687e7c0f969e8 | Fixed critical security vulnerability: replaced plaintext password storage and comparison with BCrypt hashing (encode on register, matches() on login); added BCryptPasswordEncoder bean; updated and extended UserServiceTest with a dedicated hashing assertion | Passwords were stored in plaintext — any DB leak would expose all credentials directly. This hardens authentication to industry standard. |
|                    |              | 17.05.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/d6b2a12 | Added Jest test suite (27 tests) for the math problem generation utility covering output structure, pair/block invariants, unique-solution guarantee, and normalization of both wire formats; wired up jest + ts-jest with path alias support | The problem generator is the core game mechanic and had zero test coverage — a silent bug here would send players unsolvable or ambiguous problems with no error |
