import FixtureService from "./fixtureService"

const start = async () => {

  const fixtureService = new FixtureService()

  const upIdx = process.argv.indexOf('-u');
  const countIdx = process.argv.indexOf('-c');
  const countItemsIdx = process.argv.indexOf('-i');

  const count = countIdx > -1 ? +process.argv[countIdx + 1] : 10;
  const countItems = countItemsIdx > -1 ? +process.argv[countItemsIdx + 1] : 10;

  try {
      await fixtureService.down();
      console.log('down')

      if (upIdx > -1) {
          await fixtureService.up(count, countItems);
          console.log('UP')
      }

      console.log('Fixtures run successfully!');
  }
  catch (e) {
      console.error(e, 'Fixtures failed!');
      process.exit(1);
  }

  process.exit(0);
};

start();

export {}