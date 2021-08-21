const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */

    const data = await Task.find().populate('roles.developer')

    const tasks = data.map(t => {
    if (t.roles.developer) {
        t.price = t.time.estimate * t.roles.developer.price
    }
        return t
    })

    res.render('tasks', {
        title: 'Задачи',
        isTasks: true,
        tasks
    })
})

router.get('tasks/add', auth, (req, res) => {
    res.render('add-task', {
        title: 'Новая задача'
    })
})

router.post('/edit', auth,async (req, res) => {
    const {id} = req.body // забираем id из объекта req.body в переменную
    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"

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

router.get('/:id', auth, async (req, res) => {
    /*
        req.params.id - получаем значение /:id
        course - получаем объект с курсом
     */
    const task = await Task.findById(req.params.id)
    res.render('tasks/edit', {
        title: `Задача #${task._id}`, // устанавливаем мета-title
        task // передаём объект курса
    })
})

router.get('/:id/delete', auth, async (req, res) => {
    await Task.findByIdAndRemove(req.params.id)
    res.redirect('/tasks')
})

router.get('/:id/turn-off', auth, async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, {active: false})
    res.redirect('/tasks')
})

router.get('/:id/turn-on', auth, async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, {active: true})
    res.redirect('/tasks')
})

router.post('/add', auth, async (req, res) => {
    const tasks = await Task.find()

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact},
        idx: tasks.length + 1,
        roles: {
            author: ObjectId(req.session.user._id),
            developer: ObjectId(req.session.user._id)
        }
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