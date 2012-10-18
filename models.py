from flask_sqlalchemy import SQLAlchemy
from stats import app

db = SQLAlchemy(app)

class Message(db.Model):
    __tablename__ = 'lines'

    id = db.Column(db.Integer, primary_key=True)
    network = db.Column(db.String(20))
    time = db.Column(db.DateTime)
    buffer_name = db.Column(db.String(63))
    notice = db.Column(db.Integer) # 0
    prefix = db.Column(db.String(5))
    nick = db.Column(db.String(63))
    message = db.Column(db.String(512))


    def __init__(self, network, time, buffer_name, notice, prefix, nick, message):
        self.network = network
        self.time = time
        self.buffer_name = buffer_name
        self.notice = notice
        self.prefix = prefix
        self.nick = nick
        self.message = message


    def __repr__(self):
       return "<Message('%s','%s','%s','%s', '%s')>" % (self.network, self.buffer_name, self.time, self.nick, self.message)


