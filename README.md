## Flash Sale Assignment

[Link to Assignment](https://popshoplive.notion.site/Backend-Take-Home-Assignment-b9cae5dbd099422aac7550e0ddb578b5)

## Tech Stack
* Next.js
* Typescript
* Prisma
* Postgres
* RabbitMQ
* Redis
* Auth0

## Prerequisites
* Docker
* Node.js
## How to run
"It is dangerous to go alone!" for this reason we picked a composer docker project that provides docker containers for postgres, rabbit and redis the repo is [here](https://github.com/jvelezpo/composer), run it is straightforward:
Run `docker-compose ud`
With this we will be ready to use postgres, rabbit and redis locally running on our local docker.


## Purchase flow

![Flow Diagram](https://raw.githubusercontent.com/jvelezpo/FlashSale/main/public/FlowDiagram.jpg)
## Load test
```
All virtual users finished
Summary report @ 06:12:37(-0500) 2021-10-08
  Scenarios launched:  3922
  Scenarios completed: 3922
  Requests completed:  3922
  Mean response/sec: 35.44
  Response time (msec):
    min: 3
    max: 568
    median: 8
    p95: 24
    p99: 54.3
  Scenario counts:
    Buy products: 3922 (100%)
  Codes:
    202: 1296
    400: 2626
```
