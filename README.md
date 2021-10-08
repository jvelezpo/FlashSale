## Flash Sale Assignment

Large number of users come to the system at the same time, causing a spike in traffic.
Number of purchase request is much larger than inventory size. (5000 million users competing for 100 items)

[Link to Assignment](https://popshoplive.notion.site/Backend-Take-Home-Assignment-b9cae5dbd099422aac7550e0ddb578b5)

## Tech Stack
* [Next.js](https://nextjs.org)
* [Prisma](https://www.prisma.io)
* Typescript
* Postgres
* RabbitMQ
* Redis
* [Auth0](https://auth0.com)
* [Artillery](https://artillery.io)

## Prerequisites
* Docker
* Node.js
## How to run
"It is dangerous to go alone!" for this reason we picked a composer docker project that provides docker containers for postgres, rabbit and redis the repo is [here](https://github.com/jvelezpo/composer), run it is straightforward:
* Clone the repo `git clone git@github.com:jvelezpo/composer.git`
* cd into cloned repo `cd composer`
* Run `docker-compose ud`

With this we will be ready to use postgres, rabbit and redis locally running on our local docker.

* Clone flash sale repo `git clone git@github.com:jvelezpo/FlashSale.git`
* cd into cloned repo `cd FlashSale`
* install dependencies `npm i`

Create a new `.env` file in the root of the project, for this `.env.example` can be used as a template, note `Auth0` env vars are only needed to run the UI of the project, if you need to run only the tests, `Auth0` env vars should not be necessary.

* Run migrations `npx prisma migrate dev` (this will create the necesary schema and tables).
* Run the project `npm run all` this will kick off the API server and the worker server.

The server will start in http://localhost:3000 if the `Auth0` env vars are set then you can visit the site and login into the app using google or regular user/password.

#### Tests

All tests are located into `./test` folder, these are only integration tests chai and mocha were used to write the tests.
In order to run the tests the server and the workers should be running, this means:
* Run in one terminal the server/worker `npm run all`
* Run in a diferent terminal the test suite `npm t`
## Tradeoff and decisions

* Next.js because It provides UI and a backend outof the box, and the initial thinking was to add a simple UI to query items and place purchase orders on them, due to time constraints the UI was not implemented.

* Prisma was picked as the ORM for 3 main reasons:

  - Create and run migrations with Prisma is easy and intiitive.
  - Declarative way of defining data models.
  - Typescript interfaces are automatically created base on the models.

* Handle load on read. Users will constantly refresh or place an order, for this we use Redis as a cache in memory DB, here we store the purchases in progress by the user and items already purchased as well, with this we avoid querying the main postgres DB and we can get back to the user much faster without affecting our postgres performance.

* Avoid inventory from being oversold or undersold. For this when a user does a POST request to purchase an item, we emit an event to rabbit to queue a purchase order and we respond to the user with a `202` HTTP status, meaning we accepted his/her purchase and we will process it as fast as we can (notify the user that the purchase was filled or not is not implemented, this can be implemented in multiple ways in the fure with things like, email, push notifications, websockets, SMS).

* Prevent cheating with script. user could write a script to fire request in a loop. For this we query Redis and check if the user has a purchase in progress or if the user already bought the item he/she is requesting.

* There is a env var `MAX_ITEMS_ALLOWED_TO_PURCHASE` this sets the value of max a user can buy of a specific item. example if `MAX_ITEMS_ALLOWED_TO_PURCHASE` is set to `2` a user can purchase max 2 of the same item.

* Due to time only purchase feature was implemented, refund feature was not implemented.

* `UserBalances` table in the DB is used as wallets for each user, example a user can have balance is `curerecy: USD` or `curerecy: BTC` or any other cureency supported by the platform, for this assignement we are only using `USD` as main currency but this can be extended to multiple currencies.

* Rabbit config:

  - `channel.prefetch(1)` This tells RabbitMQ not to give more than one message to a worker at a time.
  - `channel.assertQueue('task_queue', {durable: true})` queue won't be lost even if RabbitMQ restarts. 

## Code Structure

The project follow the same structure are Next.js for Views and for API endPoints which are located:

* `./pages` for each view,
* `./pages/api` for the endPoints.

For the rest of the code, such as workers, utils, models, services and more are located under `./lib`
```
├── components
│   ├── Layout.tsx
│   └── nav.tsx
├── fixtures
│   ├── fixtureService.ts
│   └── index.ts
├── models
│   ├── flashSaleItems.ts
│   ├── purchase.ts
│   └── users.ts
├── service
│   └── purchase.ts
├── utils
│   ├── encoding.ts
│   ├── init-middleware.ts
│   ├── prisma.ts
│   ├── redis.ts
│   ├── taskPublisher.ts
│   ├── taskSubscriber.ts
│   └── validate-middleware.ts
└── worker
    ├── index.ts
    └── inventory.ts
```

## DB Schema
![DB Schema](https://raw.githubusercontent.com/jvelezpo/FlashSale/main/public/SchemaDB.png)

* `Account`, `Session` and `User` were autogenerated with `next-auth` adapter for next.js [here](https://next-auth.js.org/adapters/prisma), it adds all necesary model logic to do authentication with different providers such as Auth0

* `FlashsaleItems` is used to store the information for each item that is been sold in the platform

* `Purchases` stores records of users who purchased items, alogn with the timestamp the price and the quantity of each purchase

* `UserBalances` is used as wallets for each user, example a user can have balance is `curerecy: USD` or `curerecy: BTC` or any other cureency supported by the platform, for this assignement we are only using `USD` as main currency but this can be extended to multiple currencies.

## Purchase flow

![Flow Diagram](https://raw.githubusercontent.com/jvelezpo/FlashSale/main/public/FlowDiagram.jpg)

## Load test

`artillery` is a load test tool, this is used to stress the server with multiple request/second placing purchase orders.
The artillery configuration is under `./load/artillery.yaml`, It has 1 flow of for posting purchases to the API, inside this flow it has 3 phases:

* Phase 1, warm up the serve with 5 request/second for 30 seconds
* Phase 2, ramp up the load until it gets to 100 request/second for a minute
* Phase 1, mantains the load with 100 request/second for 3 minutes

```
All virtual users finished
Summary report @ 08:47:04(-0500) 2021-10-08
  Scenarios launched:  21291
  Scenarios completed: 21291
  Requests completed:  21291
  Mean response/sec: 78.6
  Response time (msec):
    min: 3
    max: 1474
    median: 10
    p95: 38
    p99: 371
  Scenario counts:
    Buy products: 21291 (100%)
  Codes:
    202: 1644
    400: 19647
```
On this summary report we can see some important insights:

* `p95: 38` this means the percentile 95 of the request was completed under 38 msec
* `Scenarios launched` and `Scenarios completed` is the same amount, this means all request were processed
* `400: 19647` status codes by the server, this is our own logic for cases such the item is no longer available, the user already bought the item...

### How to run the load tests

* First run `npm run all`, this will kick off the API and the workers and it will also compile the code used by fixtures and workers.

* There is a fixtures feature the loads date into our postgres DB, to run it just type in a different terminal `npm run fixtures:up`, by default it will create 5000 users and 1 item with a random quantity for this item between 1-500, this is to mimic 5000 users trying to buy a limited amount of the same item.

* Finally run `npm run test:load`, this will start artillery load test, by default artillery will print every 10 seconds to the terminal until it fnish. In the server/worker terminal there should be a log for every time the worker receives an event from rabbit.
