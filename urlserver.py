from flask import Flask
from flask import url_for, render_template, Markup, g, jsonify, request
import sqlite3
import json
import re
app = Flask(__name__)
DATABASE  = '/home/xt/.weechat/urlserver.sqlite3'

def regexp(expr, item):
    reg = re.compile(expr, re.IGNORECASE)
    return reg.search(item) is not None

def connect_db():
    conn = sqlite3.connect(DATABASE)
    conn.create_function("REGEXP", 2, regexp)
    return conn

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

def get_urls(buf=None,order_by='time', search='', page=1, amount=15):
    offset = page * amount - amount
    where = 'WHERE '
    if buf:
        where += "buffer_name REGEXP '%s' or message REGEXP '%s' " %(buf, buf)
    if search:
        if buf:
            where += 'AND '
        where  +="url REGEXP '%s'" %search
    sql ='''
        SELECT
        url, number, time, nick, buffer_name, message, prefix
        FROM urls
        %s
        ORDER BY %s desc
        LIMIT %s OFFSET %s''' %(where, order_by, amount, offset)
    print "Running SQL: %s" %sql
    return query_db(sql)

@app.route('/')
@app.route('/<buf>')
def index(buf=None):
    return render_template('index.html', buffer=buf)

@app.route('/api/img')
@app.route('/api/<buf>/img')
def img(buf=None):
    search = '(\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.svg)'
    page = request.args.get('page')
    if page:
        try:
            page = int(page)
        except:
            page = 1
    else:
        page = 1
    objects = get_urls(buf,search=search,page=page)
    return jsonify(urls=objects)

@app.route('/api/stats')
@app.route('/api/<buf>/stats')
def stats(buf=None):
    where = ''
    objects =[]
    if buf:
        where = "where buffer_name REGEXP '%s'" %buf
    sql = 'select nick, count(*) as urls from urls %s group by nick order by urls desc limit 15' %where
    objects = query_db(sql)
    sql = 'select url, count(*) as count from urls %s group by url order by count desc limit 15' %where
    urlstats = query_db(sql)
    return jsonify(urlstats=urlstats,posters=objects)

#url_for('static', filename='style.css')


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8080)

