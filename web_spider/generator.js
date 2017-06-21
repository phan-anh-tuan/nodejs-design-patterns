function* fruitGenerator() {
    let fruits = ['apple','mango', 'watermelon'];
    for(let i=0; i < fruits.length; i++) {
        yield fruits[i];
    }
    return;
    //fruits.forEach((ele) => { console.log(ele)});
}

let fruitIterator = fruitGenerator();

let element = fruitIterator.next();
while (element && !element.done) {
    console.log(`fruit: ${element.value}`);
    element = fruitIterator.next();
}
