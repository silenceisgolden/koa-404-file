'use strict';

const send = require('koa-send');
const Debug = require('debug');
const fs = require('fs');
const path = require('path');
const resolve = path.resolve;
const basename = path.basename;
const extname = path.extname;

const debug = Debug('404-file');

function type(file) {
  return extname(basename(file, '.gz'));
}

function check404(filename, opts) {

  filename = filename || 'public/404.html';
  opts = opts || {};
  const maxage = opts.maxAge || 0;

  let pathfile = resolve(filename);
  let stats = fs.statSync(pathfile);

  if(!stats.isFile()) {
    throw new Error('Please specify a valid file in the relative folder you are serving static files from. Ex: public/404.html');
  }

  debug(`404 path is ${pathfile}`);

  return function check404(ctx, next) {
    return next().then(() => {

      if(404 === ctx.status && !ctx.type) {
        ctx.status = 404;
        ctx.set('Last-Modified', stats.mtime.toUTCString());
        ctx.set('Content-Length', stats.size);
        ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
        ctx.type = type(pathfile);
        ctx.body = fs.createReadStream(pathfile);
        return pathfile;
      }

      return;
    });
  }

}

module.exports = check404;
