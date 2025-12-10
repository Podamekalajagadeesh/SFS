const { expect } = require("chai");

describe("Counter", function () {
  let counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should start with count = 0", async function () {
      expect(await counter.getCount()).to.equal(0);
    });
  });

  describe("Increment", function () {
    it("Should increment the count", async function () {
      await counter.increment();
      expect(await counter.getCount()).to.equal(1);
    });

    it("Should emit CountIncremented event", async function () {
      await expect(counter.increment())
        .to.emit(counter, "CountIncremented")
        .withArgs(1);
    });
  });

  describe("Decrement", function () {
    it("Should decrement the count", async function () {
      await counter.increment();
      await counter.decrement();
      expect(await counter.getCount()).to.equal(0);
    });

    it("Should revert if count is 0", async function () {
      await expect(counter.decrement()).to.be.revertedWith(
        "Count cannot be negative"
      );
    });

    it("Should emit CountDecremented event", async function () {
      await counter.increment();
      await expect(counter.decrement())
        .to.emit(counter, "CountDecremented")
        .withArgs(0);
    });
  });
});
