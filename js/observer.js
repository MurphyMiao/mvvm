// 观察者
// 执行数据劫持
function Observer(data){
    this.data = data;
    // 循环处理data
    this.walk(data);
}

Observer.prototype = {
    walk: function(data){
        var me = this;
        Object.keys(data).forEach(function(key){
            me.convert(key, data[key])
        })
    },
    // 处理data
    convert (key, val){
        this.defineReactive(this.data, key, val)
    },
    // 数据劫持
    defineReactive (data, key, val){
        // 创建依赖收集实例
        var dep = new Dep();
        var childObj = observe(val);

        Object.defineProperty(data, key, {
            enumerable: true, //可枚举
            configurable: false, //不能再次定义,
            get (){
                // watcher实例是否存在
                if (Dep.target){
                    dep.depend()
                }
                return val;
            },
            set (newVal){
                if(newVal === val){
                    return
                }
                val = newVal;
                // 如果新值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify()
            }
        })
    }
}

// 判断是否为对象，如果是，创建一个观察者实例
function observe(value, vm){
    if (!value || typeof value !== 'object'){
        return 
    }
    return new Observer(value);
}

var uid = 0;

// 依赖收集器
// 由watcher来触发
function Dep(){
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    // 增加订阅
    addSub (sub){
        this.subs.push(sub)
    },
    depend (){
        Dep.target.addDep(this);
    },
    // 移除订阅
    removeSub (sub){
        var index = this.subs.indexOf(sub);
        if(index > -1){
            this.subs.splice(index, 1)
        }
    },

    // 
    notify (){
        this.subs.forEach(function (sub){
            sub.update()
        })
    }
}

Dep.target = null;