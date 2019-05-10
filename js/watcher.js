
// 连接observer和compiler
function Watcher(vm, expOrFn, cb){
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.depIds = {};
    if(typeof expOrFn === 'function'){
        this.getter = expOrFn
    }else{
        this.getter = this.parseGetter(expOrFn.trim())
    }

    this.value = this.get();
}

/**
 * 每次调run的时候都会触发相应属性的getter
 * getter里面会触发dep.depend，继而触发addDep
 * 加入相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
 * 则不需要讲当前的watcher添加到该属性的dep中
 * 加入相应属性是新的属性，则将当前的watcher添加到新属性的dep里
 * 如通过vm.child = {name: 'a'}改变了child.name的值，child.name就是个新属性
 * 则需要将当前watcher（child.name）加入新的child.name的dep里
 * 因为此时的child.name是个新值，之前的setter、dep都已经失效
 * 如果不把wathcer加入到心动child.name的dep中，通过child.name = xxx赋值是，对应的wathcer就收不到通知，等于是失效了
 * 每个子属性的wathcer在添加到子属性的dep的同时，也会添加到父属性的dep中
 * 监听子属性的同时，监听副属性的变更，这样，父属性改变时，子属性的watcher也能收到通知，进行update
 * 这一步是在this.get() --> this.getVMVal()里面完成，forEach时会从父级开始取值，间接调用了它的getter
 * 出发了addDep，在整个forEach过程中，当前watcher都会加入到每个父级过程属性的dep
 * 例如：当前watcher的是‘child.child.name’，那么，child、child.child，child.child.name这三个属性的dep都会加入当前wathcer
 */

Watcher.prototype = {
    update (){
        this.run()
    },
    run (){
        var value = this.get();
        var oldVal = this.value;
        if(value !== oldVal){
            this.value = value;
            this.cb.call(this.vm, value, oldVal)
        }
    },
    
    addDep (dep){
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this)
            this.depIds[dep.id] = dep
        }
    },
    get (){
        Dep.target = this;
        var value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },
    parseGetter (exp){
        if(/[^\w.$]/.test(exp)) return
        
        var exps = exp.split('.');
        
        return function (obj){
            for(let i = 0, len = exps.length; i < len; i++){
                if(!obj) return
                obj = obj[exps[i]]
            }
            return obj
        }
    }
}