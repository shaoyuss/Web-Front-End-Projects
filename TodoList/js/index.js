//待办事项列表
// let todos = [
//     {
//         text: 'Taste JavaScript',
//         done: true,
//     },
//     {
//         text: 'Buy a unicorn',
//         done: false,
//     }
// ]


//本地存储待办事项

function setItem(key,value) {
    //存储键/值
    //存储的键值都是字符串类型，如果是非字符串类型，会自动转换成字符串类型再存储
    //value是todos数组，把数组转换成JSON形式的字符串，存储到本地存储中
    localStorage.setItem(key,JSON.stringify(value))
}

function getItem(key) {
    //根据键获取值并解析json
    return JSON.parse(localStorage.getItem(key)) || []
}


let todos = getItem('todos')
//存储当前要编辑的todo
let editingTodo = null
//存储当前锚点
let hash = location.hash


//加载列表

function loadTodos(todos) {
    let todolistUL = document.querySelector('.todo-list')
    let arr = []

    //遍历数组，拼接li，存储到arr数组
    todos.forEach(function (todo,index){
        arr.push(
            '<li class="'+ (todo === editingTodo ? 'editing' : '') +'">'+
                '<div data-index="'+ index +'" class="view">'+
                    '<input data-index="'+ index +'" id="'+ index +'" class="toggle" type="checkbox"'+ (todo.done ? 'checked' : '') +'>'+
                    '<label data-index="'+ index +'" for="'+ index +'" class="'+ (todo.done ? 'completed' : '') +'">'+ todo.text +'</label>'+
                    '<button data-index="'+ index +'"  class="destroy">Delete</button>'+
                '</div>'+
                '<input class="edit" type="text" data-index="'+ index +'" value="'+ todo.text +'" data-flag="'+ (todo === editingTodo ? 'true' : 'false') +'">'+
            '</li>'
        )
    })

    todolistUL.innerHTML = arr.join('')

    //显示未完成的条目数
    setUncompletedCount()
    //是否显示clear completed
    showclearcompleted()

    //保存
    setItem('todos',todos)
    
}

loadTodos(todos)
show()


//录入待办事项

let txtNewTodo = document.querySelector('.new-todo')
txtNewTodo.onkeyup = function(e) {
    // console.log(e.keyCode)
    if(e.keyCode !== 13) return;

    //回车
    //把新录入的待办事件添加到待办事项数组中todos
    //unshift添加到数组的第一项
    todos.unshift({
        text: this.value,
        done: false,
    })
    // console.log(todos)
    //重新加载列表
    loadTodos(todos)
    show()

    //清空文本框
    this.value = ''
}



//单击事件通过事件委托，注册给父元素(删除事件和改变完成状态事件)

let todolistUL = document.querySelector('.todo-list')
let timer = null;

todolistUL.onclick = function(e) {
    clearTimeout(timer); //清除未执行的定时器

    //避免单双击冲突，进行延时处理
    timer = setTimeout(function () {
        let index = e.target.dataset.index

        //如果非编辑状态
        if(document.querySelectorAll('.edit')[index].dataset.flag === 'false'){
            //删除选中的条目
            //判断当前点击的是否是destroy
            if(e.target.matches('.destroy')){
                //从按钮上获取自定义属性data-index索引
                let index = e.target.dataset.index
                //从数组中把对应的待办事项删除
                todos.splice(index,1) //从原数组中删除对应的项
                //重新加载列表
                loadTodos(todos)
                
            }else{//改变选中条目的完成状态
                
                todos[index].done=!todos[index].done
                //重新加载列表
                loadTodos(todos)
                
                //点击任意条目，如果有一个CheckBox没有选中，则全选图标不显示选中，
                //反之若所有条目都已选中，全选图标显示选中状态

                //获取数组长度
                let chkCount = todos.length
                //获取已选中的条目个数
                let chkCheckedCount = document.querySelectorAll('.toggle:checked').length
                let chkToggleAll = document.querySelector('header img')
                if(chkCount === chkCheckedCount && chkCount !== 0){
                    chkToggleAll.src = 'img/全选2.png'
                }else{
                    chkToggleAll.src = 'img/全选1.png'
                }
            }
            
            show()
        }
        
    }, 200);
}


//全选待办事项

let chkToggleAll = document.querySelector('header img')

//1.点击全选图标，让所有条目完成状态和全选图标象征的状态一致
chkToggleAll.onclick = function(){

    //改变图标
    if(this.dataset.flag === 'false'){
        chkToggleAll.src = 'img/全选2.png'
        this.dataset.flag = 'true'
    }else{
        chkToggleAll.src = 'img/全选1.png'
        this.dataset.flag = 'false'
    }

    //改变所有条目状态
    //通过that记录this
    let that = this
    //找到所有CheckBox
    let chks = document.querySelectorAll('.toggle')
    //设置所有待办事项的完成状态
    chks.forEach(function(chk,index){
        if(that.dataset.flag === 'true'){
            todos[index].done = true
        }else{
            todos[index].done = false
        }
    })

    //重新加载列表
    loadTodos(todos)
    show()
}

//2.点击任意条目，如果有一个CheckBox没有选中，则全选图标不显示选中，
//反之若所有条目都已选中，全选图标显示选中状态
//转移到事件委托中写



//显示未完成的条目数
//每次数据改变就要调用，因此在loadTodos中调用
function setUncompletedCount(){
    //过滤todos，返回为数组，获取未完成项的个数
    let count = todos.filter(function (todo){
        return !todo.done
    }).length

    document.querySelector('.show span').textContent = count

}


//实现编辑功能

//给label注册双击事件，可以通过事件委托，委托给父元素ul
todolistUL.ondblclick = function(e) {
    clearTimeout(timer); //清除未执行的定时器

    //判断当前点击的是label
    if(e.target.matches('.todo-list li label')){
        //获取当前label对应的索引
        let index = e.target.dataset.index
        //记录我们当前要编辑的待办事项，editingTodo指向当前要编辑的待办事项对象
        editingTodo = todos[index]
        //重新渲染
        loadTodos(todos)
        show()
        //让文本框自动获得焦点
        document.querySelectorAll('.edit')[index].focus()

        //编辑文本框失去焦点，实现编辑功能
        //给编辑按钮注册blur事件
        let txtEdits = document.querySelectorAll('.edit')
        txtEdits.forEach(function(txtEdit){
            txtEdit.onblur = function(){
                editTodo(this)
            }
        })
    }
}

//给文本框注册键盘事件keyup
todolistUL.onkeyup = function(e){
    if(e.target.matches('.edit')){
        // console.log(e.keyCode)
        //1.如果按下esc取消编辑
        if(e.keyCode === 27){
            //不显示编辑文本框
            editingTodo = null
            //重新渲染
            loadTodos(todos)
            show()
        }
        //2.如果按下回车，确认编辑
        if(e.keyCode === 13){
            //编辑待办项
            editTodo(e.target)
        }
    }

}

//编辑待办项
//判断文本框中的内容，如果文本框无内容则删除该条目
//如果有内容则更新
function editTodo(txt) {
    if(txt.value.length === 0){
        let index = txt.dataset.index
        todos.splice(index,1)

    }else{
        //把文本框中的内容，重新设置给待办项
        editingTodo.text = txt.value.trim()
        editingTodo = null
        
    }
    loadTodos(todos)
    show()
}


//清除所有完成项

//是否显示clear completed
//判断当前todos中是否有完成项，如果有则显示clear completed(清除已完成按钮)，否则隐藏
//每次改变数据都要调用，因此在loadTodos函数中调用
function showclearcompleted(){
    //获取todos数组中已完成项的个数
    let count = todos.filter(function(todo){
        return todo.done
    }).length
    let btn = document.querySelector('.footer span:last-child')
    if(count > 0){
        //显示按钮
        //这里不是块元素，因此不能用block
        //display属性的值为空的时候，相当于没有设置display属性
        //元素的显示模式默认是显示
        btn.style.display = ''
    }else{
        //隐藏按钮
        btn.style.display = 'none'
    }
}

//点击清除已完成按钮，把数组中已经完成的数据删除
let btn = document.querySelector('.footer span:last-child')
btn.onclick = function(){
    //过滤掉已完成的，得到全是未完成条目的数组
    todos = todos.filter(function(todo){
        return !todo.done
    })
    loadTodos(todos)
    show()
}


//切换

//hashchange 锚点变化的事件
//监听到地址栏锚点的变化
window.addEventListener('hashchange',function(){
    let links = document.querySelectorAll('.show span a')
    hash = location.hash
    links.forEach(function(link){
        //删除所有span标签激活状态
        link.parentNode.classList.remove('selected')
        
        //当前锚点对应的标签激活
        let index = link.href.indexOf('#')
        let href = link.href.substr(index)
        // console.log(href)
        //判断url中hash值和a标签的href中#开始的值是否一致
        if(hash === href){
            link.parentNode.classList.add('selected')
        }
    })

    show()

})

//根据目前的锚点，对列表元素进行相应的显示隐藏处理
function show(){
    let lis = document.querySelectorAll('.todo-list li')
    todos.forEach(function(todo,index){
        if(hash === '#/active'){
            lis[index].style.display = !todo.done ? 'block': 'none'
        }
        else if(hash === '#/completed'){
            lis[index].style.display = todo.done ? 'block': 'none'
        }
        else{
            lis[index].style.display = 'block'
        }
    })
}


