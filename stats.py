from flask import Flask
from flask import url_for, render_template, Markup, g, jsonify, request, Response
from functools import wraps

import json
import re
import sqlalchemy as sa
from sqlalchemy.sql import extract
from sqlalchemy.sql import func


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://weeurls:P!"#uppen@localhost/weechat'

from models import *


@app.route('/')
def index():
    lines = Message.query.limit(100)
    #lines_per_month = db.session.query(Message.id, sa.sql.func.count(Message.id)).group_by( sa.sql.extract(Message.time, 'year') ).all()
    linecount = db.session.query(func.count(Message.id)).scalar()
    lines_per_nick = db.session.query(Message.nick, func.count(Message.nick)).group_by(Message.nick).order_by('count_1 desc').all()

    return render_template('stats.html', **locals())

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8080)

