class Experiment {
    constructor() {
        this.name = "exp";
    }
    hello() {
        var expOne = new ExperimentOne();
        console.log('hello exp');
        expOne.say();
    }
}