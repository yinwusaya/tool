const promise = new MyPromise((resolve,reject) => {
    resolve(1)
    resolve(1)
    resolve(1)
    resolve(1)
}).then(res => {
    console.log(res)
})

// const promise = new Promise((resolve,reject) => {
//     resolve(1)
//     resolve(1)
//     resolve(1)
//     resolve(1)
// })
