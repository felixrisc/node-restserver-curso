const express = require('express');

const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

// Muestra todas las categorias
app.get('/categoria', verificaToken,(req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario' ,'nombre email')
        .exec((err,categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({},(err,conteo) =>{
            res.json({
                ok: true,
                categorias,
                cuantos: conteo
            });
        });
    });
});

// Muestra una categoria
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id,(err,categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});

// Crear nueva categoria
app.post('/categoria',verificaToken, (req, res) => {
    // Regresa nueva categoria
    // req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
          descripcion: body.descripcion,
          usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
             ok: true,
             categoria: categoriaDB
        });
      });
});

// Actualiza una categoria
app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id,descCategoria,{new: true, runValidators: true},(err,categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });

});

// Muestra una categoria
app.delete('/categoria/:id',[verificaToken,verificaAdmin_Role], (req, res) => {
    // Solo un administrador puede borrar categorias
    // La categoria se borra fisicamente
    let id = req.params.id;

    Categoria.findByIdAndRemove(id,(err,borrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!borrado) {
            return res.status(400).json({
                ok: false,
                err:{
                    mensaje: 'Categoria no encontrada'
                }
                
            });
        }
        res.json({
            ok: true,
            categoria: borrado
        })
    });
});

module.exports = app;