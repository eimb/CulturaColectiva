/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/versionPosts              ->  index
 * POST    /api/versionPosts              ->  create
 * GET     /api/versionPosts/:id          ->  show
 * PUT     /api/versionPosts/:id          ->  update
 * DELETE  /api/versionPosts/:id          ->  destroy
 */

 'use strict';

 import _ from 'lodash';
 var sqldb = require('../../sqldb');
 var VersionPost = sqldb.VersionPost;
 var Post = sqldb.Post;

 function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
    .then(updated => {
      return updated;
    });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
      .then(() => {
        res.status(204).end();
      });
    }
  };
}

// Gets a list of VersionPosts
export function index(req, res) {
  VersionPost.findAll()
  .then(responseWithResult(res))
  .catch(handleError(res));
}

// Gets a single VersionPost from the DB
export function show(req, res) {
  VersionPost.find({
    where: {
      idArticulo: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(responseWithResult(res))
  .catch(handleError(res));
}

// Creates a new VersionPost in the DB
export function create(req, res) {  

  let {titulo, contenido} = req.body;
  let idArticulo;

  let createVersion = () =>{
    VersionPost.create({
      idArticulo: idArticulo,
      titulo,
      contenido,
      fechaModificacion: new Date(),
      idEstatus:1

    }).then(v=> res.send(v))
    .catch(handleError(res));
  };
  /*.. cRea primero el post y despues la version..*/
  if(!req.body.idArticulo)
  {
    return Post.create({
      idEstatus:1
    })
    .then(a=>{      

      idArticulo = a.idArticulo;

      return createVersion();       
    })
  }  
}

// Updates an existing VersionPost in the DB
export function update(req, res) {
  let {titulo, contenido} = req.body;
  let idArticulo;

  /*--Crear Version--*/
  let createVersion = () =>{
    VersionPost.create({
      idArticulo: idArticulo,
      titulo: titulo,
      contenido,
      fechaModificacion: new Date(),
      idEstatus:1
    }).then(v=> res.send(v))
    .catch(handleError(res));
  };
  /*--Consultar Versiones y cambia estado a 0 de la ultima version--*/
  let consultaVersiones = () =>{
    VersionPost.findAll({
      where: {
        idArticulo: req.params.id
      }
    }).then((result)=>{     

     var LastVersion= result[result.length -1];

     LastVersion.idEstatus = 0;
     LastVersion.save(); 
   
   }).catch(handleError(res));
  };
  /*....*/ 
  idArticulo= req.body.idArticulo;
  createVersion();
  consultaVersiones();
  
}



// Deletes a VersionPost from the DB
export function destroy(req, res) {
  VersionPost.find({
    where: {
      idArticulo: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(handleError(res));
}
