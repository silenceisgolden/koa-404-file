'use strict';

const request = require('supertest');
const check404 = require('..');
const Koa = require('koa');
const serve = require('koa-static');
const convert = require('koa-convert');
const fs = require('fs');

describe('koa-404-file test suite', function() {
  describe('check koa static', function () {

    it('should find index', function(done) {
      const app = new Koa();

      app.use(check404());
      app.use(convert(serve('./test/fixtures')));

      request(app.listen())
      .get('/')
      .expect(200, done);
    });

  });
  describe('main features', function() {

    it('should serve 404 page', function(done) {
      const main404 = fs.readFileSync('./test/fixtures/404.html').toString();
      const app = new Koa();

      app.use(check404());
      app.use(convert(serve('public')));

      request(app.listen())
      .get('/nofindingthis/')
      .expect(404)
      .end((err, res) => {
        if(err) return done(err);
        if(res.text != main404) {
          console.log(res.body);
          return done(new Error('Incorrect response'));
        }
        return done();
      });
    });

    it('should error if specified 404 file is not found', function(done) {
      const app = new Koa();

      try {
        app.use(check404('./test/fixtures/no404/404.html'));
      } catch(err) {
        return done();
      }

      return done(new Error('Expected error'));

    });

    it('should error if directory is specified instead of file', function(done) {
      const app = new Koa();

      try {
        app.use(check404('./test/fixtures/no404'));
      } catch(err) {
        return done();
      }

      return done(new Error('Expected error'));
    });

  });
});
