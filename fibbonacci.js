let rollingSum = 2;

function fibbonacci(prev, curr) {
    let next = prev + curr;

    rollingSum += next%2 == 0 ? next : 0

    if (next < 4000000) {
        fibbonacci(curr, next);
    }
}

fibbonacci(1, 2)

console.log(rollingSum);