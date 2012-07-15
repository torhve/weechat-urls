from flask import Flask
from flask import url_for, render_template, Markup, g, jsonify
import sqlite3
import json
import re
app = Flask(__name__)
DATABASE  = '/home/xt/.weechat/urlserver.sqlite3'

def regexp(expr, item):
    reg = re.compile(expr)
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

def get_urls(order_by='time', search='', page=1, amount=100):
    offset = page * amount - amount
    if search:
        search ='''
        WHERE
            buffer_name REGEXP '%s'
        OR
            url REGEXP '%s'
        OR
            message REGEXP '%s'
        OR
            nick REGEXP '%s'
                ''' %(search, search, search, search)
    sql ='''
        SELECT
        url, number, time, nick, buffer_name, message, prefix
        FROM urls
        %s
        ORDER BY %s desc
        LIMIT %s OFFSET %s''' %(search, order_by, amount, offset)
    print "Running SQL: %s" %sql
    return query_db(sql)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/img')
def img():
    search= '(.jpg|.jpeg|.png|.gif|.bmp|.svg)'
    objects = get_urls(search=search)
    return jsonify(urls=objects)

#url_for('static', filename='style.css')


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8080)

