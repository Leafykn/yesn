export {makeDecorator} from "./core/decorators";
import {Component} from "./core/directive";

@Component({
    template:'123',
})
class TestComponent{
    constructor(){
        console.log(this);
    }
}

// console.log(TestComponent)

// @Component({
//     template:'456',
// })
// class Test2Component{
//     constructor(){
//         console.log(this);
//     }
// }

let a = new TestComponent();
// console.log(a);
// let b = new Test2Component();