let apples_data;
let alarm_clocks_data;
let cats_data;

const CAT = 0;
const ALARM_CLOCK = 1;
const APPLE = 2;

const len = 784;
const total_data = 1000;

let apples = {};
let alarm_clocks = {};
let cats = {};

let nn;

function preload(){
    apples_data = loadBytes('./data/apple1000.bin');
    alarm_clocks_data = loadBytes('./data/alarm_clock1000.bin');
    cats_data = loadBytes('./data/cat1000.bin');
}

function prepareData(category, data, label){
    category.training = [];
    category.testing = [];

    for (let i = 0; i < total_data; i++) {
        let offset = i * len;
        let threshold = floor(.8 * total_data);

        if (i < threshold) {
            category.training[i] = data.bytes.subarray(offset, offset + len);
            category.training[i].label = label
        } else {
            category.testing[i - threshold] = data.bytes.subarray(offset, offset + len);
            category.testing[i - threshold].label = label
        }
    }
}

function trainEpoch(training){
    for (let i = 0; i < training.length; i++) {
        // for(let i = 0; i < 1; i++){
        let inputs = []
        let data = training[i]
        inputs = data.map((x => x / 255));
        let label = training[i].label;


        let targets = [0, 0, 0];
        targets[label] = 1;

        nn.train(inputs, targets);

    }
}

function testAll(testing) {
    let correct = 0;
    for (let i = 0; i < testing.length; i++) {
    // for (let i = 0; i < 1; i++) {
        let inputs = []
        let data = testing[i]
        inputs = data.map((x => x / 255));
        let label = testing[i].label;

        let guess = nn.predict(inputs)

        // console.log(guess)

        let m = max(guess);
        let classification = guess.indexOf(m);
        // console.log(guess);
        // console.log(classification);
        // console.log(label)

        if(classification == label){
            correct ++;
        }

        
    }
    let percentage = 100 * correct / testing.length;
    return percentage

}

function draw(){
    strokeWeight(8);
    stroke(255)
    if(mouseIsPressed){
        line(pmouseX, pmouseY, mouseX, mouseY);
    }
}

function setup(){
    createCanvas(280,280);
    background(0);

    prepareData(cats,cats_data, CAT)
    prepareData(apples, apples_data, APPLE)
    prepareData(alarm_clocks, alarm_clocks_data, ALARM_CLOCK)
    
    nn = new NeuralNetwork(784,64,3);
    
    let training = [];
    training = training.concat(cats.training);
    training = training.concat(alarm_clocks.training);
    training = training.concat(apples.training);
    shuffle(training,true);

    let testing = [];
    testing = testing.concat(cats.testing);
    testing = testing.concat(alarm_clocks.testing);
    testing = testing.concat(apples.testing);
    console.log(testing)

   
    let trainButton = select('#train');
    let epochCounter = 0;
    trainButton.mousePressed(function(){
        trainEpoch(training);
        epochCounter++;
        console.log('Epoch: ' + epochCounter)
    })
    
    let testButton = select('#test')
    testButton.mousePressed(function(){
        let percentage = testAll(testing);
        console.log('percent: ' + nf(percentage,2,2) + "%")
    })
    
    let guessButton = select('#guess')
    guessButton.mousePressed(function(){
        let inputs = [];
        let img = get();
        img.resize(28,28);
        img.loadPixels();

        for (let i = 0; i < len; i++) {
            let bright = img.pixels[i*4];
            inputs[i] = bright / 255.0
        }

        console.log(inputs);

        let guess = nn.predict(inputs)
        let m = max(guess);
        let classification = guess.indexOf(m);

        if(classification === CAT){
            console.log('cat')
        }else if (classification == APPLE){
            console.log('apple')
        }else if(classification == ALARM_CLOCK){
            console.log('alarm clock')
        }
    })

    

    // let total = 100;
    // for (let n = 0; n < total; n++) {
    //     let img = createImage(28,28, );
    //     img.loadPixels();
        
    //     let offset = n * 784;
    //     for (let i = 0; i < 784; i++) {
    //         let val = apples_data.bytes[i + offset];
    //         img.pixels[i * 4 + 0] = val;
    //         img.pixels[i * 4 + 1] = val;
    //         img.pixels[i * 4 + 2] = val;
    //         img.pixels[i * 4 + 3] = 255;
    //     }
    //     let x = (n % 10) * 28;
    //     let y = floor(n / 10) * 28;
    //     img.updatePixels(img,x,y);
    // }
}