// 定义promise的状态
const states = {
    PENDING: "pending",
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
}

const isThenable = (val) => val && (typeof val.then === 'function')

class MyPromise{
    constructor(executor) {
        // 被resolve的值
        this._value = undefined
        // 被reject的值
        this._reason = undefined
        this._state = states.PENDING
        // 存储保存对应返回的Promise对应的处理函数
        this._thenQueue = []
        this._finallyQueue = []
        if(executor) {
            executor(
                this._onFulfilled.bind(this),
                this._onRejected.bind(this)
            )
        }
    }

    then(onFulfilled,onReject) {
        const nextPromise = new MyPromise()
        this._thenQueue.push([nextPromise,onFulfilled,onReject])
        if (this._state === states.REJECTED) {
            this._handleOnReject()
        } else if (this._state === states.FULFILLED) {
            this._handleFulfilledQueue()
        }
        return nextPromise
    }

    finally(sideEffect) {
        if(this._state !== states.PENDING) {
            if (sideEffect) {
                sideEffect()
            }
            return this._state === states.FULFILLED ? MyPromise.resolve(this._value) : MyPromise.reject(this._reason)
        } else {
            const nextPromise = new MyPromise()
            this._finallyQueue.push([nextPromise,sideEffect])
            return nextPromise
        }
    }

    _onFulfilled(val) {
        if(this._state === states.PENDING) {
            this._state = states.FULFILLED
            this._value = val
        }
    }

    _onRejected(val) {
        if (this._state === states.PENDING) {
            this._state = states.REJECTED
            this._reason = val
        }
    }

    _handleFulfilledQueue() {
        this._thenQueue.forEach(([nextPromise,onFulfilled]) => {
            if (onFulfilled) {
                const valOrPromise = onFulfilled(this._value)
                if(isThenable(valOrPromise)) {
                    valOrPromise.then(
                        val => nextPromise._onFulfilled(val),
                        result => nextPromise._onRejected(result)
                    )
                } else {
                    nextPromise._onFulfilled(valOrPromise)
                }
            } else {
                nextPromise._onFulfilled(this._value)
            }
        })

        this._thenQueue = []
    }

    _handleOnReject(val) {
        this._thenQueue.forEach(([nextPromise,_,onReject]) => {
            if(onReject) {
                const valOrPromise = onReject(this._reason)
                if(isThenable(valOrPromise)) {
                    valOrPromise.then(
                        val => nextPromise._onFulfilled(val),
                        result => nextPromise._onRejected(result)
                    )
                } else {
                    nextPromise._onFulfilled(this._reason)
                }
            } else {
                nextPromise._onRejected(this._reason)
            }
        })
    }

    catch(onRejected) {
        return this.then(undefined,onRejected)
    }

}
MyPromise.resolve = (value) => {
    return new MyPromise((resolve,reject) => {
        resolve(value)
    })
}

MyPromise.reject = (value) => {
    return new MyPromise((resolve,reject) => {
        reject(value)
    })
}
