/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/posts              ->  index
 * POST    /api/posts              ->  create
 * GET     /api/posts/:id          ->  show
 * PUT     /api/posts/:id          ->  update
 * DELETE  /api/posts/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var sqldb = require('../../sqldb');
var Post = sqldb.Post;
var VersionPost = sqldb.VersionPost;

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

// Gets a list of Posts
export function index(req, res) {
  Post.findAll({
    include: [VersionPost]
  })
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Post from the DB
export function show(req, res) {
  Post.find({
    where: {
      idArticulo: req.params.id
    },
     include: [VersionPost]
  })
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));


}

// Creates a new Post in the DB
export function create(req, res) {
  /*Post.create(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));*/
}

// Updates an existing Post in the DB
export function update(req, res) {
  console.log(req.body); 
  
  if (req.body.idArticulo) {
    delete req.body.idArticulo;
  }
  Post.find({
    where: {
      idArticulo: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Post from the DB
export function destroy(req, res) {
 console.log("entre a la funcion delete :" + req.params.id );
 delete req.params.id; 
  /*Post.find({
    where: {
      idArticulo: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));*/
   
}
