const express = require('express');

const {verificaToken} = require('../middlewares/autenticacion');

const app = express();

const Producto = require('../models/producto');

// Obtener productos
app.get('/producto',verificaToken,(req, res) => {
    // Obtiene todos los productos
    // populate: usuario categoria
    // Paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({disponible: true})
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('categoria','descripcion')
        .populate('usuario' ,'nombre email')
        .exec((err,productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({},(err,conteo) =>{
            res.status(201).json({
                ok: true,
                productos,
                cuantos: conteo
            });
        });
    });

})

// Obtener un producto por Id
app.get('/producto/:id',verificaToken,(req, res) => {
    // Obtiene un producto x id
    // populate: usuario categoria
    let id = req.params.id;

    Producto.find({_id:id})
            .populate('categoria','descripcion')
            .populate('usuario' ,'nombre email')
            .exec((err,productoDB) => {
                // if (err) {
                //     return res.status(500).json({
                //         ok: false,
                //         err
                //     });
                // }
                
                if (!productoDB) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            mensaje: 'No existe producto'
                        }
                    });
                }

                res.json({
                    ok: true,
                    producto: productoDB
                })
    })
})

// Buscar productos
app.get('/producto/buscar/:termino',verificaToken,(req,res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
            .populate('categoria','nombre')
            .exec((err,productos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productos
               });
            })
})

// Crear nuevo producto
app.post('/producto',verificaToken,(req, res) => {
    // Grabar el usuario
    // grabar categoria del listado
    
    let body = req.body;

    let producto = new Producto({
          nombre: body.nombre,
          precioUni: body.precioUni,
          descripcion: body.descripcion,
          categoria: body.categoria,
          usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
             ok: true,
             producto: productoDB
        });
      });
})

// Actualizar un producto
app.put('/producto/:id',(req, res) => {
    // Grabar el usuario
    // grabar categoria del listado
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id,(err,productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'El ID producto no existe'
                }
            });
        }

        
        productoDB.nombre= body.nombre,
        productoDB.precioUni= body.precioUni,
        productoDB.descripcion= body.descripcion,
        productoDB.categoria= body.categoria,
        productoDB.disponible= body.disponible
        

        productoDB.save((err, productoActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
    
            if (!productoActualizado) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
    
            res.json({
                 ok: true,
                 producto: productoActualizado
            });
          });
    })

    

    
})

// Borrar un producto
app.delete('/producto/:id',verificaToken,(req, res) => {
    // disponible pasa a falso
    let id = req.params.id;

      let nuevoEstado = {
          disponible: false
      }

      Producto.findByIdAndUpdate(id,nuevoEstado,{new: true},(err,borrado) => {
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
                    mensaje: 'Producto no encontrado'
                }
                
            });
        }
        res.json({
            ok: true,
            producto: borrado
        })
      });
    
});

module.exports = app;