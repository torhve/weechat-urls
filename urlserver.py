from flask import Flask
from flask import url_for, render_template, Markup, g
import sqlite3
import json
app = Flask(__name__)
DATABASE  = '/home/xt/.weechat/urlserver.sqlite3'

def connect_db():
    return sqlite3.connect(DATABASE)

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
    return query_db(sql)

@app.route('/')
def index():
    objects = []
    for obj in get_urls():
        url = obj['url']
        if url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg')):
            #obj = '<div class="obj"><img src="%s" title="%s" alt="%s"></div>' % (url, url, url)
            objects.append(obj)
    objects = json.dumps(objects)
    return render_template('index.html', objects=objects)



#url_for('static', filename='style.css')


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8080)

