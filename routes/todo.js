const express = require('express');
const router = express.Router();

let todos = [
    {
        id: 1, task: 'Belajar Node.js', completed: false
    },
    {
        id: 2, task: 'Membuat API', completed: false
    },
];

// Endpoint untuk mendapatkan data Todos
router.get('/', (req, res) => { res.json(todos); });

router.post('/', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});
router.delete('/:id', (req,res)=>{
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    if(todoIndex===-1) return res.status(404).json({message: 'Tugas tidak ditemukan'});
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    res.status(200).json({message: `Tugas'${deletedTodo.task}'Telah dihapus`});
});
router.put('/:id', (req,res)=>{ 
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({message: 'Tugas tidak ditemukan'});
    todo.task = req.body.task || todo.task;
    res.status(200).json({
        message: `Tugas dengan ID ${todo.id} telah diperbarui`,
        updatedTodo:todo
    });
});


module.exports = router;