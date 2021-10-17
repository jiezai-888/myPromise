//resolve,reject是改变状态的两个函数

class Promise{
	constructor(executor){
		//对象状态：promiseState
		//对象结果：promiseResult
		this.promiseState='pending';
		this.promiseResult=null;
		this.callbackArray=[];
		//保存实例的this
		const that=this;
		
		//resolve和reject均为独立函数,会覆盖掉同名形式参数
		function resolve(data){
			//如果调用这种函数，则this指向window/global.
			//要使用实例的this.
			if(that.promiseState!=='pending') return;
			that.promiseState='fulfilled';
			that.promiseResult=data;
			// if(that.callback.onResolved){
			// 	that.callback.onResolved(data);
			// }
			
			//同状态下链式then的调用
			setTimeout(()=>{
				that.callbackArray.forEach((item)=>{
					item.onResolved(data);
				})
			})
			// console.log('resolve被调用')
		};
		function reject(data){
			if(that.promiseState!=='pending') return;
			that.promiseState='rejected';
			that.promiseResult=data;
			// if(that.callback.onRejected){
			// 	that.callback.onRejected(data);
			// }
			
			setTimeout(()=>{
				that.callbackArray.forEach((item)=>{
					item.onRejected(data);
				})
			})
			
			// console.log('rejected被调用');
		};
		//执行器同步调用
		try{
			executor(resolve,reject);
		}catch(e){
			//抛出错误时执行
			//TODO handle the exception
			reject(e);
		}
	}
	
	then(onResolved,onRejected){
		const that=this;
		console.log("现在输出onRejected：",onRejected)
		//错误传递
		if(typeof onRejected!=='function'){
			console.log("失败错误传递11111111");
			onRejected=reason=>{
				throw reason;
			}
		}
		if(typeof onResolved!=='function'){
			console.log("成功错误传递2222222");
			onResolved=value=>{
				return value;
			}
		}
		// console.log("这里的resolve===456345 ",that.resolve);
		return new Promise((resolve,reject)=>{
			// console.log("这里的resolve=== ","结果为:",this.promiseResult);
			function callback(type){
				try{
					let result=type(that.promiseResult);
					console.log("result===",result);
					if(result instanceof Promise){
						result.then(v=>{
							resolve(v);
						},r=>{
							reject(r);
						})
					}else{
						resolve(result);
					}
				}catch(e){
					//抛出错误时执行
					//TODO handle the exception
					reject(e);
				}
			}
			
			if(this.promiseState==='fulfilled'){
				//变为异步执行
				setTimeout(()=>{
					callback(onResolved);
				})
			}
			//
			if(this.promiseState==='rejected'){
				setTimeout(()=>{
					callback(onRejected);
				})
			}
			
			//这个是异步回调使用的
			if(this.promiseState==='pending'){
				this.callbackArray.push({
					onResolved:function(){
						callback(onResolved);
					},
					onRejected:function(){
						callback(onRejected);
					}
				});
			}
		})
	}
	
	catch(onRejected){
		return this.then(undefined,onRejected);
	}
	
	static resolve(value){
		return new Promise((resolve,reject)=>{
			if(value instanceof Promise){
				value.then(v=>{
					resolve(v);
				},r=>{
					reject(r);
				})
			}else{
				resolve(value);
			}
		});
	}
	
	static reject(reason){
		return new Promise((resolve,reject)=>{
			reject(reason);
		});
	}
	
	static all(statesArray){
		return new Promise((resolve,reject)=>{
			let count=0;
			//保存promise状态为成功的结果数组
			let arr=[];
			for(let i=0;i<statesArray.length;i++){
				statesArray[i].then(v=>{
					count++;
					//考虑异步情况下，状态更改延迟
					//保持数组索引与状态结果数组一一对应
					arr[i]=v;
					if(count===statesArray.length){
						resolve(arr);
					}
				},r=>{
					reject(r);
				});
			}
		});
	}
	
	static race(statesArray){
		return new Promise((resolve,reject)=>{
			for(let i=0;i<statesArray.length;i++){
				//for循环不管你执不执行完成，都会先遍历完成，所以时间很短
				//可以忽略该时间带来的影响.
				statesArray[i].then(v=>{
					resolve(v);
				},r=>{
					reject(r);
				})
			}
		});
	}
	
}

// function Promise(executor){
	
// }

// Promise.prototype.then=function(onResolved,onRejected){
// 	// console.log("then方法被调用,状态为:",this.promiseState);
	
// }

// Promise.prototype.catch=function(onRejected){
// 	// console.log("======catch===456345 ",this.then);
// }


// Promise.resolve=function(value){
	
// }

// Promise.reject=function(reason){
// 	return new Promise((resolve,reject)=>{
// 		reject(reason);
// 	});
// }

// Promise.all=function(statesArray){
	
// }

// Promise.race=function(statesArray){
// }

