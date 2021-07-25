const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const router = Router()

router.get('/', async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */
    const tasks = await Task.find()
    res.render('tasks', {
        title: 'Задачи',
        isTasks: true,
        tasks
    })
})

router.get('/add', (req, res) => {
    res.render('add-task', {
        title: 'Новая задача'
    })
})

router.post('/edit', async (req, res) => {
    const {id} = req.body // забираем id из объекта req.body в переменную
    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"
    /*
        findByIdAndUpdate() - метод Mongoose, ищем по _id и обновляем
        1 параметр - id
        2 параметр - объект update (что обновляем)
     */
    // await Task.findByIdAndUpdate(id, req.body)
    const body = {
        name: req.body.name,
        body: req.body.body,
        time: {
            estimate: req.body.estimate,
            fact: req.body.fact
        }
    }
    await Task.findByIdAndUpdate(id, body)
    res.redirect('/tasks')
})

router.get('/:id', async (req, res) => {
    /*
        req.params.id - получаем значение /:id
        course - получаем объект с курсом
     */
    const task = await Task.findById(req.params.id)
    res.render('edit-task', {
        title: `Задача #${task._id}`, // устанавливаем мета-title
        task // передаём объект курса
    })
})

router.post('/add', async (req, res) => {
    const tasks = await Task.find()

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact},
        idx: tasks.length + 1
    })

    try {
        await task.save() // вызываем метод класса Task для сохранения в БД

        // делаем редирект после отправки формы
        res.redirect('/tasks')
    } catch (e) {
        console.log(e)
        res.end()
    }
})

module.exports = router